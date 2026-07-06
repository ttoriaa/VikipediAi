#!/usr/bin/env python3
"""Build right-side button config for the VikipediAi homepage."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib import parse
from urllib import request


DEFAULT_SOURCE_FEED_URL = "https://ttoriaa.github.io/vikipedia/assets/github-projects.json"


def fetch_json(url: str) -> Any:
    # Allow local file sources for environments with restricted outbound networking.
    if "://" not in url and Path(url).exists():
        return json.loads(Path(url).read_text(encoding="utf-8-sig"))

    if url.startswith("file://"):
        parsed = parse.urlparse(url)
        file_path = Path(parse.unquote(parsed.path.lstrip("/")))
        return json.loads(file_path.read_text(encoding="utf-8-sig"))

    req = request.Request(url)
    req.add_header("Accept", "application/json")
    req.add_header("User-Agent", "vikipediai-right-buttons-sync")
    with request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def to_slug(value: str) -> str:
    lowered = value.lower().strip()
    safe = []
    for ch in lowered:
        if ch.isalnum():
            safe.append(ch)
        elif ch in {"-", "_"}:
            safe.append("-")
        else:
            safe.append("-")
    slug = "".join(safe)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-") or "site"


def build_button(project: dict[str, Any]) -> dict[str, str]:
    name = str(project.get("name") or "Project").strip() or "Project"
    url = str(project.get("url") or "").strip()
    return {
        "id": f"site-{to_slug(name)}",
        "name": name,
        "label_zh": f"打开 {name}",
        "label_en": f"Open {name}",
        "href": url,
        "target": "_blank",
        "rel": "noopener",
    }


def parse_csv_names(raw: str) -> list[str]:
    if not raw.strip():
        return []
    return [chunk.strip() for chunk in raw.split(",") if chunk.strip()]


def sync_right_buttons(
    source_feed_url: str,
    output_path: Path,
    limit: int,
    include_names: list[str],
) -> int:
    payload = fetch_json(source_feed_url)
    projects = payload.get("projects") if isinstance(payload, dict) else None
    if not isinstance(projects, list):
        raise RuntimeError("Source feed format invalid: missing projects array")

    include_map: dict[str, dict[str, Any]] = {}
    for item in projects:
        if isinstance(item, dict):
            name = str(item.get("name") or "").strip()
            if name:
                include_map[name.lower()] = item

    selected: list[dict[str, Any]] = []
    seen_urls: set[str] = set()

    # Always prioritize explicitly included names first.
    for name in include_names:
        project = include_map.get(name.lower())
        if not project:
            continue
        url = str(project.get("url") or "").strip()
        if not url or url in seen_urls:
            continue
        selected.append(project)
        seen_urls.add(url)

    for item in projects:
        if len(selected) >= limit:
            break
        if not isinstance(item, dict):
            continue
        url = str(item.get("url") or "").strip()
        if not url or url in seen_urls:
            continue
        selected.append(item)
        seen_urls.add(url)

    buttons = [build_button(project) for project in selected[:limit]]

    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_feed_url": source_feed_url,
        "button_count": len(buttons),
        "buttons": buttons,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return len(buttons)


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync VikipediAi right-side button config")
    parser.add_argument("--source-feed-url", default=DEFAULT_SOURCE_FEED_URL)
    parser.add_argument("--output", default="assets/right-buttons.json")
    parser.add_argument("--limit", type=int, default=6)
    parser.add_argument("--include-names", default="vikipedia,VikipediAi")
    args = parser.parse_args()

    count = sync_right_buttons(
        source_feed_url=args.source_feed_url,
        output_path=Path(args.output),
        limit=max(1, args.limit),
        include_names=parse_csv_names(args.include_names),
    )
    print(f"Synced {count} right buttons to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
