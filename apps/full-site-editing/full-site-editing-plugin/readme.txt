=== Full Site Editing ===
Contributors: alexislloyd, allancole, automattic, bartkalisz, codebykat, copons, dmsnell, get_dave, glendaviesnz, gwwar, iamtakashi, jeryj, Joen, kwight, marekhrabe, mattwiebe, mkaz, mmtr86, mppfeiffer, nrqsnchz, obenland, okenobi, vindl, noahtallen, owolski, nosolosw
Tags: block, blocks, editor, gutenberg, page
Requires at least: 5.0
Tested up to: 5.3
Stable tag: 1.0
Requires PHP: 5.6.20
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Enhances your page creation workflow within the Block Editor.


== Description ==

This plugin comes with a custom block to display a list of your most recent blog posts, as well as a template selector
to give you a head start on creating new pages for your site. It also provides a way to change your font settings globally from the page editor.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/full-site-editing` directory, or install the plugin through the WordPress plugins screen directly.
1. Activate the plugin through the 'Plugins' screen in WordPress.
1. Create a new page and select a template that best suits your needs.
1. Place the "Blog Posts Listing" block anywhere you want inside the block editor.


== Frequently Asked Questions ==

= Can I use this plugin in production? =

We'll be making frequent updates to the plugin as we flesh out its feature set. You're welcome to try it, just be aware that it is only designed to work on the WordPress.com environment and could break after an update.

= How is the Blog Posts Listing block different from the Latest Posts block in Core? =

It adds an excerpt! And meta information! It really is much more useful, especially if your looking for a block that gives readers a better idea about your latest posts than just the title.

= Do you provide support for this plugin? =

This plugin is experimental, so we don't provide any support for it outside of websites hosted on WordPress.com at this time.


== Changelog ==

= 1.0 =
* Fix for site editor option override.
* Hide post title in Gutenberg depending on theme mod.
* Fix post list block sync script compatibility.
* Remove hook for enqueueing site editor assets.
* Move site editor item to top level menu in wp-admin.

= 0.26 =
* SPT IE bug fix.

= 0.25 =
* G2 and Gutenberg 7.7.1 compatibility fixes.
* Update to blog posts block v1.2.
* Add custom WordPress.com block patterns.
* SPT and NUX compatibility improvements.

= 0.24 =

* Starter Page Templates: fix overflow issue with feature image in blog posts.
* Global Styles: add new font (Raleway).

= 0.23 =
* Dotcom Block Editor NUX: disable by default

= 0.22 =
* Starter Page Templates: Improved previews with many visual glitches fixed
* Starter Page Templates: Make page title visibility depend on theme setting
* Starter Page Templates: Hide templates using unavailable blocks
* Starter Page Templates: Track template insertion on Dotcom sites
* Site Editor: initialize core FSE on Dotcom sites
* Enable Gutenberg NUX with Gutenberg copy
* Improved unit testing commands

= 0.21 =
* Linting fixes and page layout selector improvements.

= 0.20 =
* Fix text domain for i18n for Event Countdown and Timeline

= 0.19 =
* Starter Page Templates: Added more than twenty new block editor page templates.
* Starter Page Templates: Fix issues with full width blocks in the preview.
* General: Fix style compatibility with the latest versions of the block editor.

= 0.18.2 =
* Address core/nux package deprecation.

= 0.18 =
* Blog Posts Block: Tag Exclusion feature
* Blog Posts Block: Image orientation issues resolved.
* Blog Posts Block: Full width alignment issue resolved.

= 0.17 =
* Introduces Blog Posts block, a better version of Posts List.

= 0.16.2 =
* Fix for Global Styles. Logged out users weren't getting the fonts properly.

= 0.16.1 =
* Improve style of the template part preview.
* Consistent back button styles.

= 0.16 =
* Delegate FSE support detection to themes by leveraging the theme tags.
* Enable Global Styles for all template-first themes.
* Fix back button navigation issues.
* Keep the sidebar layout selector open by default.
* Fix editor styles with new Gutenberg version.
* Click anywhere on header/footer block to Navigate to editor.

= 0.15.1 =
* Always open the layout selector if the `?new-homepage` query argument exists.

= 0.15 =
* Add ability to change page layout for existing pages.
* Expose Homepage layouts from other themes in page layout picker.

= 0.14 =
* Stop using theme classes for template parts to improve support for FSE blocks' style attributes.

= 0.13 =
* Incorporate Global Styles plugin functionality.
* Side-load images on template insertion.
* Remove widgets menu from wp-admin.

= 0.12 =
* Change menu order of default pages that FSE creates to 1.

= 0.11 =
* Add color, background color, font size, and text alignment support to the Site Title, Site Description, and Navigation Menu blocks.

= 0.10 =
* Update page template selector with template preview.

= 0.9 =
* Rename wp_template CPT to wp_template_part.

= 0.7 =
* Change theme support to Maywood instead of Modern Business.
* Improve style support and UX issues.
* Remove featured image support for pages.
* No longer load FSE editor if theme is unsupported.
* Improve autosave support.
* Add embed/shortcode support to header and footer.
* Several other high priority fixes for the FSE editor.

= 0.6.1 =
* Updates priority of filter so classnames are added properly to the template blocks.

= 0.6 =
* Fix issues with Edit template and Back to Page functionality.

= 0.5 =
* Fetch templates data from the API.
* Improve UX flows and fix styling issues.

= 0.4 =
* Move template data initialization out of the plugin and delegate it to themes.

= 0.3 =
* Update modal UI.

= 0.2.2 =
* Posts List Block - fixes Edit link to only display for users with appropriate permissions.

= 0.2.1 =
* Starter Page Templates - bug fix with sub-locales.
* Starter Page Templates - fix momentum scrolling on Modal on iOS.
* Starter Page Templates - improve comprehension of Templates listing by forcing 2col layout on small viewports.
* Starter Page Templates - introduced version constant for cache busting purposes.

= 0.2 =
* Bug fixes and performance improvements.

= 0.1.1 =
* Latest round of updates

= 0.1 =
* Initial Release
