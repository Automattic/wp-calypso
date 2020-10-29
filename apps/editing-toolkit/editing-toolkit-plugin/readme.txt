=== WordPress.com Editing Toolkit ===
Contributors: alexislloyd, allancole, automattic, bartkalisz, codebykat, copons, dmsnell, get_dave, glendaviesnz, gwwar, iamtakashi, iandstewart, jeryj, Joen, jonsurrell, kwight, marekhrabe, mattwiebe, mkaz, mmtr86, mppfeiffer, noahtallen, nosolosw, nrqsnchz, obenland, okenobi, owolski, philipmjackson, vindl
Tags: block, blocks, editor, gutenberg, page
Requires at least: 5.0
Tested up to: 5.5
Stable tag: 2.8.2
Requires PHP: 5.6.20
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Enhances the editing experience in the Block Editor.

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

= 2.8.2 =
* Gutenberg: Support new line height setting (https://github.com/Automattic/wp-calypso/pull/46792)
* Gutenberg: Make line-height setting more robust. (https://github.com/Automattic/wp-calypso/pull/46873)

= 2.8.1 =
* Launch: Added persistent launch button. (https://github.com/Automattic/wp-calypso/pull/46558)

= 2.8 =
* Editing Toolkit: Load patterns from the rest API endpoint v3 (https://github.com/Automattic/wp-calypso/pull/46463)
* Contextual-tips: remove /block-editor from URL (https://github.com/Automattic/wp-calypso/pull/46592)
* Premium Content: Fix margins on child blocks in Varia based themes (https://github.com/Automattic/wp-calypso/pull/46579)
* Premium Content Block: Remove the intermediate block UI. (https://github.com/Automattic/wp-calypso/pull/46619)
* ET/FSE: Remove the "Showcase New Blocks" module (https://github.com/Automattic/wp-calypso/pull/46663)
* Add text domain to copy in domain-picker and plans-grid packages (https://github.com/Automattic/wp-calypso/pull/46557)
* Gutenboarding: stop HotJar capturing input fields in gutenboarding (https://github.com/Automattic/wp-calypso/pull/46620)
* Launch: Move launch store to package/data-stores. (https://github.com/Automattic/wp-calypso/pull/46570)
* Launch: Hide inline help button when launch modal opens. (https://github.com/Automattic/wp-calypso/pull/46768)
* Localise the launch sidebar and final launch step (https://github.com/Automattic/wp-calypso/pull/46555)

= 2.7.2 =
* Enable Coming Soon v2 for a12s

= 2.7.1 =
* Coming Soon v2: adding links to default page (https://github.com/Automattic/wp-calypso/pull/46441)
* Remove "gutenboarding/new-launch" feature flag and checks. (https://github.com/Automattic/wp-calypso/pull/46453)
* Fixes Global Styles plugin translation (https://github.com/Automattic/wp-calypso/pull/46421)

= 2.7 =
* Added launch flow mobile layout (https://github.com/Automattic/wp-calypso/pull/45714).
* Added vertical space above the first content block when the page title is hidden. (https://github.com/Automattic/wp-calypso/pull/46003)
* Removed the Premium Content block from the "New" category, and add it to the "Earn" category. (https://github.com/Automattic/wp-calypso/pull/45978)
* Styling fixes to Recurring Payments block. (https://github.com/Automattic/wp-calypso/pull/46125)
* Styling fixes to Premium Content block. (https://github.com/Automattic/wp-calypso/pull/46125)

= 2.6.1 =
* Fixed an error in the Premium Content token subscription service that causing some fatal errors if the auth token was missing (https://github.com/Automattic/wp-calypso/pull/45878)

= 2.6 =
* Correct regressions to the Premium Content block. (https://github.com/Automattic/wp-calypso/pull/45777)

= 2.5 =
* Site setup: use selected features to recommend a plan (https://github.com/Automattic/wp-calypso/pull/45718)
* Lint markdown files (https://github.com/Automattic/wp-calypso/pull/45691)

= 2.4 =
* Remove direct dependency on `swiper` (https://github.com/Automattic/wp-calypso/pull/45492)
* Fix core patterns incorrectly appearing in block patterns inserter (https://github.com/Automattic/wp-calypso/pull/45499)
* Fixed typo in "multi-column text with headline" block pattern (https://github.com/Automattic/wp-calypso/pull/45682)
* Fix Fatal Error from Custom Exceptions (https://github.com/Automattic/wp-calypso/pull/45656)

= 2.3 =
* Bump NewsPack version to 1.8.0 (https://github.com/Automattic/wp-calypso/pull/45423)
* Starter Page Templates: Add Current layout to page layout picker when editing a homepage (https://github.com/Automattic/wp-calypso/pull/43980)
* Add tracks events for the block editor sidebar (https://github.com/Automattic/wp-calypso/pull/45429)
* Site setup: add PlansGrid accordion (https://github.com/Automattic/wp-calypso/pull/45054)
* Disable the sidebar if the editor is not in fullscreen mode (https://github.com/Automattic/wp-calypso/pull/45561)

= 2.2 =
* Improve experience of opening and closing the sidebar with assistive technology (https://github.com/Automattic/wp-calypso/pull/45349)

= 2.1 =
* Fix site editor loading problem with Gutenberg 8.9.0 (https://github.com/Automattic/wp-calypso/pull/45360)
* Added fallback for site vertical (https://github.com/Automattic/wp-calypso/pull/45010)
* Update pages sidebar design in block editor (https://github.com/Automattic/wp-calypso/pull/45242)
* Fix FSE Mailerlite translations namespacing (https://github.com/Automattic/wp-calypso/pull/45206)
* Premium Content: Fix duplicate Stripe nudge notification (https://github.com/Automattic/wp-calypso/pull/45255)
* Update the Editing Toolkit readme (https://github.com/Automattic/wp-calypso/pull/45212)
* Premium Content: Fix redirect behavior after connecting to Stripe (https://github.com/Automattic/wp-calypso/pull/45204)
* Hide editor sidebar first time users sees the editor (https://github.com/Automattic/wp-calypso/pull/43716)
* Add an aria-label to (W), in header and sidebar, that describes what the button is for, when sidebar is closed "Open sidebar", when W button is open "You are viewing sidebar. To close select "esc". (https://github.com/Automattic/wp-calypso/pull/45266)
* Add aria-label for "View all pages" link: aria-label="View all pages in Dashboard" (or posts as appropriate)  (https://github.com/Automattic/wp-calypso/pull/45266)
* Use an h2 instead of a div for the “Posts” heading  (https://github.com/Automattic/wp-calypso/pull/45266)
* Set autoFocus to (W) icon when sidebar opens  (https://github.com/Automattic/wp-calypso/pull/45266)


= 2.0 =
* Rename directories from "full-site-editing*" to "editing-toolkit*" (https://github.com/Automattic/wp-calypso/pull/44501)
* Update/premium content loading assets code cleanup (https://github.com/Automattic/wp-calypso/pull/45052)
* FSE: Add Newspack assets unit tests (https://github.com/Automattic/wp-calypso/pull/43218)

= 1.22 =
* Premium Content: load assets using proper hook (https://github.com/Automattic/wp-calypso/pull/44825)
* EditingToolkit > GlobalStyles: Add new Google fonts (https://github.com/Automattic/wp-calypso/pull/44750)

= 1.21 =
* Site setup: Redirect to user's home after checkout. For both composite and old checkouts. And for simple and atomic (e-commerce) sites. See (https://github.com/Automattic/wp-calypso/pull/44881).
* Block patterns: Only call unregister on the columns category if currently registered. See (https://github.com/Automattic/wp-calypso/pull/44903)
* Block editor: Always enable line-height in Gutenberg settings. See (https://github.com/Automattic/wp-calypso/pull/44772)

= 1.20 =
* Site setup: Fix delay when starting the flow because of the editor save action.
* Site setup: Fix possible race condition causing the site to be immediately launched when pressing Complete Setup button.
* Site setup: Clear Free plan selection when a custom domain is selected.
* Site setup: Start the flow at the first incomplete step.
* Site setup: Use site title and existing subdomain as fallbacks for domain search.
* Site setup: Update step completion to be derived from state instead on saved in Launch store.

= 1.19 =
* Fix error in editor when accessing page as a non-user super admin.

= 1.18 =
* Fix broken link on mobile when selecting launch flow.

= 1.17 =
* Site setup list: fix bug opening customer home inside iframe.
* Site setup list: show clickable links in launch summary step.

= 1.16 =
* Enable site launch flow for dev & horizon environment.
* Premium Content: Remove Paid wording from title.
* Premium Content: Fix duplicate Connect To Stripe message.

= 1.15 =
* Plugin display name changed to WordPress.com Editing Toolkit.
* The donation block has been removed from the plugin.
* Add a launch sidebar to the editor to walk the user through the launch flows.
* Improved contrast of links in the navigation sidebar.
* Fix formatting of the site title in the navigation sidebar.
* Fix broken site editor close button when navigation sidebar is active.

= 1.14 =
* Add missing dependencies to package declaration.
* Remove "Latest posts" page from navigation sidebar.

= 1.13 =
* Change the category of FSE blocks from legacy to the updated ones (https://github.com/Automattic/wp-calypso/issues/43198).
* Add a helper function that can be used to assign categories with older fallbacks.
* Add support for TypeScript tests.
* Update visual style of navigation sidebar.
* Fix navigation sidebar dismiss button in IE.
* Fix missing block inserter on dotcom FSE sites.

= 1.12 =
* Experimental navigation sidebar in block editor, can be enabled in config or with a hook.
* Default content included in the donation block can be edited.
* Track when the launch button is clicked.

= 1.11 =
* Fix broken blocks in page layout picker preview in Firefox.
* Add settings to the donation block.
* Fix premium content block to ensure it is auto-selected when mounted.
* Add fallback to donations block to set default products if none are already defined.
* Fix block pattern preview viewport scaling.
* Fix broken site editor page.
* Add one time payment option to payment plans.
* Add a general transform to premium content.
* Fix custom font size in block patterns previews.

= 1.10 =
* Improvements to the premium blocks.
* Add 10 new block patterns.
* Post List Block: Fix deprecation note update button layout.

= 1.9 =
* Add Mailerlite subscriber widget.
* When launching a site created via `/new`, save the post content.
  Prevent lost content alert.
* Update block pattern categories.
* Fix text-domain of translated strings.

= 1.8 =
* Fix issue with Newspack blocks not loading assets.
* Fix block-editor NUX issues.

= 1.7 =
* Save the post before navigation when launching a WordPress.com site.
* Add handling for site launch on WordPress.com.
* Performance improvements in the block editor.

= 1.6 =
* Remove the "Edit as HTML" options for the inner blocks of the Premium Content Block.
* Remove plugin that notified users of the new location of Block Patterns.
* Support for any UTF-8 character in the Premium Content block.
* Fixed availability of Premium Content subscription email service.
* Premium Content block styles adjusted to only load when block is used.
* Hide Gutenberg's inserter (in favor of ours).
* Use `require` (rather than `require_once`) for asset files.
* Flag Premium Content blocks as paid to make clear they require a paid plan.
* Onboarding: Fix the dimensions of the preview image.

= 1.5 =
* Global Styles: Fix a "Bad array access" error.
* Remove default link colors from the editor (fixed in Gutenberg v8.1.0).
* Add contextual tips to the Block Inserter Menu.
* Add Premium Content Block success message on plan creation.
* Rename Posts Carousel Block to Post Carousel Block.

= 1.4 =
* Update Premium Block Style and Behaviour
* Support for Premium Content in email subscription and reader.
* Add plugin to notify users of Block Patterns new location.
* Add default link colors to the editor.

= 1.3 =
* Update Premium Content Block icon.
* Add Showcase New Blocks module.
* Add new patterns, and update pattern order.
* Bump newspack-blocks version to 1.5.0.
* Remove page layout preview from document settings.
* Fixed Call To Action block pattern when CoBlocks, FSE and Layout Grid are active.

= 1.2 =
* New Post Carousel block.
* New Premium Content block.
* Update header button styling and full width block margins for Gutenberg v8.0.0.
* Only load common module assets if they are required.
* Remove loading of blank.css for Global Styles.

= 1.1 =
* New block patterns.
* Performance and style improvements.

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
