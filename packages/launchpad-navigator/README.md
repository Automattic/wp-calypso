# Launchpad Navigator

This package provides the components for showing and interacting with
one or more Launchpad task lists for a given site.

## Usage

First you need to import the components:

```js
import {
    FloatingNavigator,
    LaunchpadNavigatorIcon,
} from '@automattic/launchpad-navigator';
```

This simple example shows how to render the navigator icon and the 
floating navigator component:

```js
function renderApp() {
    const [ showNavigator, setShowNavigator ] = useState( false );
    return (
        <>
            <Button onClick={ setShowNavigator( ! showNavigator ) }>
                <LaunchpadNavigatorIcon siteSlug={ siteSlug } />
            </Button>
            { showNavigator && (
                <FloatingNavigator siteSlug={ siteSlug } />
            ) } 
        </>
    );
}
```