Page 404
========

Page 404 is a React component to display a "Page not found" text, but in a nicer way.

## Usage

Just render the component with `ReactDOM` to some DOM node:

```js
import Page404 from 'components/page-404';

ReactDOM.render(
    <Page404 />,
    document.getElementById('root')
);

```

Or add it as a child to some other React component:

```js
import Page404 from 'components/page-404';

class SomeReactComponent extends Component {
    render() {
        return (
            <div>
                <Page404 />
            </div>
        );
    }
}
```