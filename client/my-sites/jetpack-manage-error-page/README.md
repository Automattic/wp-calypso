Jetpack Manage Error Pages
==========================

This component is used to catch Jetpack management errors at a high level,
and render an appropriate error page before any management tools are rendered.

This component is an extension of the [EmptyContent component][1], and it accepts
the same properties.
[1]: https://github.com/Automattic/wp-calypso/tree/master/shared/components/empty-content

Additionally, this component accepts a `template` property which will render some pre-defined
templates. Here are acceptable values for `template` along with examples of how to use them.

### updateJetpack

To display a page that will prompt the user to update Jetpack.
You'll need to declare `site` which is simply the current site object.
You can optionally declare `version` to display what version is necessary (defaults to 3.4).

```
JetpackManageErrorPage = require( 'my-sites/jetpack-manage-error-page' );

<JetpackManageErrorPage
    template="updateJetpack"
    site={ JetpackSite }
    version="3.4"
/>
```

### optInManage

To display a page that will prompt the user to opt-in to Jetpack manage:

```
<JetpackManageErrorPage
    template="optInManage"
    site={ this.props.site }
/>
```

### default

As stated above, this component renders an `emptyContent` component by default. For example:

```
JetpackManageErrorPage = require( 'my-sites/jetpack-manage-error-page' );

// create the component using properties accepted by EmptyContent
<JetpackManageErrorPage
    action={ this.translate( 'Manage general settings' ) }
    actionURL="../../settings/general/"
    title={ this.translate( 'No security configuration is required.' ) }
    line={ this.translate( 'Security management is automatic for WordPress.com sites.' ) }
    illustration="/calypso/images/drake/drake-jetpack.svg"
/>
```
