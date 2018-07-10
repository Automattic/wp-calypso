# Gutenberg Design Principles & Vision

This living document serves to describe some of the design principles and patterns that have served in designing the editor interface. The purpose is to explain the background for the design, to help inform future improvements.

![Block](https://cldup.com/7HCnN5cFc0.png)

This document will also go over how a _good block_ should be designed.

## Goal of Gutenberg

The all-encompassing goal of Gutenberg is to create a post and page building experience that makes it easy to create _rich post layouts_. From the [kickoff post](https://make.wordpress.org/core/2017/01/04/focus-tech-and-design-leads/):

> The editor will endeavour to create a new page and post building experience that makes writing rich posts effortless, and has “blocks” to make it easy what today might take shortcodes, custom HTML, or “mystery meat” embed discovery.

We can extract from this the following:

- Authoring rich posts is a key strength of WordPress.
- The block concept aims to unify multiple different interfaces under a single umbrella. You shouldn't have to write shortcodes, custom HTML or paste URLs to embed. You should only have to learn how the block works, and then know how to do everything.
- "Mystery meat" refers to hidden features in software, that you have to discover. WordPress already supports a large amount of blocks and 30+ embeds, so let's increase their visibility so people don't install plugins thinking it isn't already there.

## Why

One thing that sets WordPress apart from other systems is that it allows you to create as rich a post layout as you can imagine -- but only if you know HTML & CSS and build your own custom theme. By thinking of the editor as a tool to let you write rich posts, and in a few clicks create beautiful layouts, hopefully, we can make people start to love WordPress and what it can do for your content, as opposed to pick it because it installed with one click.

## Vision

**Everything is a block**. Text, images, galleries, widgets, shortcodes, and even chunks of custom HTML, no matter if it's added by plugins or otherwise. You should only have to learn to master a single interface: the block interface, and then you know how to do everything.

**All blocks are created equal**. They all live in the same inserter interface. We use recency, search, tabs, and grouping, to ensure the blocks you use the most are easily within reach.

**Drag and drop is additive**. Only when explicit actions (click or tab & space) exist, can we add drag and drop as an additive enhancement on top of it.

**Placeholders are key**. If your block can have a neutral placeholder state, it should. An image placeholder block shows a button to open the media library, a text placeholder block shows a writing prompt. By embracing placeholders we can predefine editable layouts, so all you have to do is _fill in the blanks_.

**Direct manipulation**. The block technology we are building optimizes for the user experience of manipulating content directly on the page. Plugin and theme authors will have the ability of composing together the different tools core will provide to create their own tailored and specific blocks that give users a WYSIWYG environment for creating on the web.

**Customization**. What previously required using complicated markup and shielding users from breaking it—through shortcodes, meta-fields, etc. becomes easier and more intuitive. With blocks a developer would be able to provide a theme-specific block that directly renders a portion of a layout (a three columns grid of features, for instance) and clearly specifies what can be directly edited by the user. That means the user gets a WYSIWYG experience where they can't ruin the markup established but can easily update text, swap images, reduce the number of columns, etc, without having to ask the developer for it and without fearing that they will break things.

Ultimately, the vision for Gutenberg is to make it much easier to author rich content. Through ensuring good defaults, wrapping and bundling advanced layout options blocks, and making the most important actions immediately available, authoring content with WordPress should be accessible to anyone.

## Interface Blueprints

Basic editor interface:

![Basic Interface](https://cldup.com/NDhf6ofFmq.png)

Block interface:

![Block Selected](https://cldup.com/GlUdQnu0TR.png)

Gutenberg has a basic separation between a bar at the top, and content below.

The **editor bar** holds _document level_ actions. Like editor mode, save status indicator, global actions for undo/redo/insert, the settings toggle, and finally publish options.

The **content area** holds the document itself.

The **settings sidebar** holds document metadata. Both for the document itself (tags, categories, schedule etc.), but also for blocks in the "Block" tab.

On mobile, the sidebar is hidden until you click the cog button to open it. On a desktop you can dismiss it for an immersive writing experience.

## The Block Interface

The block itself is the most basic unit of the editor. Everything is a block, and you build them together mimicking the vertical flow of the underlying HTML markup. By surfacing each section of the document as a block we can manipulate, we can attach features that are unique to each block, contextually. Inspired by desktop layout apps, it's a way to add a breadth of advanced features without weighing down the UI.

The block interface holds _basic actions_. Through ensuring good defaults, and only the most common actions, you should be able to get all your blogging done without ever having to use the Settings sidebar.

The block itself has multiple states:

- An _unselected block_ is the closest thing to a live preview of the contents itself.
- A _selected block_ shows the "quick toolbar", direct actions that manipulate the block. Extra elements can also be surfaced in the block content itself. For example an image block surfaces a caption field, a quote surfaces a citation field, and dynamic blocks can surface buttons to let you add form fields.

Note that _selection_ and _focus_ can be different, i.e. an image block can be selected but the focus can be on the caption field, exposing extra (caption-specific) UI.

As you scroll down a page on long blocks, the quick toolbar unsticks from the block, and sticks to the top of the screen.

## Editor Settings

If your block needs advanced configuration, those live in the Settings sidebar. Editor block settings can also be reached directly by clicking the cog icon next to a block.

The sidebar has two tabs, Document and Block:

- The "Document" tab shows metadata and settings for the post or page being edited.
- The "Block" tab shows metadata and settings for the currently selected block.

Don't put anything in the sidebar "Block" tab that is necessary for the basic operation of your block. Your user might dismiss the sidebar for an immersive writing experience. So pick good defaults, and make important actions available in the quick toolbar.

Examples of actions that could go in the "Block" tab of the sidebar could be:

- drop cap for text
- number of columns for galleries
- number of posts, or category, in the "Latest Posts" block
- any configuration that you don't _need_ access to in order to perform basic tasks

## Block Design Checklist, Do's and Don'ts, and Examples

The following is a list of blocks and which options go where. If you're developing a new block, hopefully this can help suggest where to put an option.

This is the basic recipe for a block:

- It should have a nice icon and label for the Inserter. Keep it simple.
- When you insert it, it should have a good placeholder state. If it's meant for text input, provide good placeholder text. If it's meant to hold media, have buttons for uploading or accessing media libraries, drop-zones for drag and drop, or anything else. The placeholder state will be used to make page and post templates in the future.
- Your block when unselected should preview its contents.
- Your block when selected can surface additional options, like input fields, or — if necessary for basic operation — buttons to configure the block directly.
- Every block should, at minimum, show a description in the "Block" tab of the Settings sidebar. You can access this for any block by clicking the cog next to the selected block.
- Additional block options and configuration can be added to the "Block" tab, but keep in mind a user might dismiss the sidebar and never use it, so you can't put configuration critical to the block here.

Here are a couple of block examples, describing which options go where, and why.

### Text

The most basic unit of the editor. Text is a simple input field.

Placeholder:

- Simple placeholder text that says "New Paragraph".

Selected state:

- Quick Toolbar: Has a switcher to perform transformations to headings, etc.
- Quick Toolbar: Has basic text alignments
- Quick Toolbar: Has inline formatting options, bold, italic, strikethrough and link

Editor block settings:

- Has description: "This is a simple text only block for inserting a single paragraph of content."
- Has option to enable or disable a drop-cap. Note that the drop-cap is only visible in the blocks unselected (preview) state.

_Because the drop-cap feature is not critical to the basic operation of the block, it's in the advanced sidebar, thus keeping the Quick Toolbar light-weight._

### Image

Basic image block.

Placeholder:

- A generic gray placeholder block with options to upload an image, drop an image directly on it, or pick an image from the media library. The placeholder block can be laid out as if it was an actual image, and this layout persists when a user adds an actual image into it.

Selected state:

- Quick Toolbar: Alignments, including wide and full-wide (if the theme supports it).
- Quick Toolbar: Edit Gallery (opens media library)
- Quick Toolbar: Link button
- A caption input field appears with a "Write caption..." placeholder text below the image

Editor block settings:

- Has description: "Worth a thousand words."
- Has options for changing or adding `alt` text, and adding additional custom CSS classes.

_Future improvements to the Image block could include getting rid of the media modal, in place of letting you select images directly from the placeholder itself. In general, try to avoid modals._

### Latest Posts

Placeholder:

- Has no placeholder, as it works fine upon insertion. The default inserted state shows the last 5 posts.

Selected state:

- Quick Toolbar: Alignments
- Quick Toolbar: Options for picking list view or grid view

Editor block settings:

- Has description: "Shows a list of your site's most recent posts."
- Has options for showing the post date, changing the default number of posts to show, and an option for adding an additional CSS class.

_Latest Posts is fully functional as soon as you insert it, because it comes with good defaults._

### Contact Form

Placeholder:

- Has no placeholder, as the default inserted state shows a functional contact form.

Selected state:

- Quick Toolbar: Alignments
- Shows "Remove" buttons next to fields that can be removed.
- Shows an "Add field" button, which opens a popout where you can select additional contact field options.

Editor block settings:

- Has description: "A basic contact form."
- Has options for making email address mandatory, checked by default.
- Has options for changing the form ID/name, in case you have multiple forms on a page.

_Note: this block doesn't exist in Gutenberg currently, but the above describes a "best practices" for designing such a block. Being one of the more complex blocks, it's still important that it is fully functional upon insertion, helped along by good defaults._

## Future Opportunities

Gutenberg as part of the kickoff goal is primarily limited to the confines of the _content area_ (specifically `post_content`) of posts and pages. Within those confines, we are embracing the web as a vertical river of content, by appending blocks sequentially, then adding layout options to each block.

But just like how the verticality of the web itself doesn't prevent more advanced layouts from being possible, similarly there isn't any fixed limit to the kind of layout Gutenberg will be able to accomplish. As such, it's very possible for Gutenberg to grow beyond the confines of post and page _content_, to include the whole page, including everything that surrounds the content.

One way to think of it is a theme template being just a comma separated list of blocks, like this:

```{
{
  'themename/header',
  'themename/sidebar',
  'core/content' {
    'core/cover-image',
    'themename/author-card',
    'core/text',
  },
  'themename/footer',
}
```

Every block nested inside the _content_ block would be _rearrangable_. Every block would be _editable_. Every block would be built using the same API, and both the editor and the theme would load the same `style.css` file directly. In the end you'd see the same in the editor/page builder, as you would looking at the theme/front-end itself.

*Page Templates*. Since blocks have empty states, it becomes easy to imagine theme templates being a declaration of which blocks compose a given page. These blocks would naturally guide a user to fill the information necessary to achieve what the theme promises it can deliver — it's very common that users struggle to mimic the theme demo that caught their attention. These templates could function similarly to apps like Keynote, where you can choose a specific template when creating a new page and have content blocks already laid out to help you achieve specific looks.

This concept is speculative, but it's one direction Gutenberg could go in the future.

## More resources

If you'd like to contribute, you can download a Sketch file of the Gutenberg mockups. Note that those are still mockups, and not 1:1 accurate. It is also possible that the Sketch files aren't up-to-date with the latest Gutenberg itself, as development sometimes moves faster than our updating of the Sketch files!

**<a href="https://cloudup.com/c8Rbgsgg3nq">Download Sketch mockups & patterns files</a>**.

Be sure to also read <a href="https://wordpress.org/gutenberg/handbook/reference/faq/">the FAQ</a>, and <a href="https://wordpress.org/gutenberg/handbook/">how to build blocks</a>.
