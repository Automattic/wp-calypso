Styles
======

Calypso uses Sass to build its CSS and compile it to `public/style.css`. Remember that all styles end up in a single file, so all styles will apply to every page, all the time. Make sure you namespace your styles for the page you are working on.

### Adding a new Sass file

If you are adding a new Sass file to `assets/stylesheets` you will need to reference the file in `assets/stylesheets/style.scss` for it to load. We have three directories to organize the respective files: layout, sections, and shared. If you are adding a new file you are likely adding it to `sections`.

Component specific stylesheets are referenced in the file `assets/stylesheets/_components.scss`.

Check [our styleguide](https://github.com/Automattic/wp-calypso/blob/master/docs/coding-guidelines/css.md) for more information on how we use Sass.
