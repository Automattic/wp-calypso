# Pattern Metadata Sidebar

A WordPress plugin that adds a pattern metadata sidebar to the WordPress post editor, allowing designers to annotate patterns on the internal patterns blog with various terms to help AI produce better designs for the [Big Sky Plugin](https://github.com/Automattic/big-sky-plugin).

## Overview

This plugin is designed to be deployed to the Dotcom Simple codebase and do run _only_ on the internal patterns website.

It is a utility plugin that allows designers working on Big Sky to annotate patterns on the internal patterns blog with various terms which helps the AI produce better designs.

**Important**: This plugin does not require the Big Sky Plugin and is completely standalone.

## Usage

1. Create or edit a post in the WordPress block editor on the internal Patterns blog.
2. Look for the "Pattern Metadata" sidebar (accessible via the sidebar toggle)
3. Configure the current pattern attributes as required.
4. Configure preferred next pattern attributes with the same options
5. Save the post.

## Data Storage

The plugin stores pattern metadata as JSON in the `_a8c_big_sky_patterns_metadata` post meta field:

```json
{
	"alignment": "centered",
	"textDensity": "medium",
	"mediaDensity": "light",
	"preferredNextAlignment": "pull-left",
	"preferredNextTextDensity": "heavy",
	"preferredNextMediaDensity": "medium"
}
```

## Support

For help with this plugin reach out to the #big-sky team in Slack.
