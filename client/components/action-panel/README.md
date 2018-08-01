Action Panel
============

This is a larger [`Card` component](../../components/card) that has a title, description, right-aligned figure and call-to-action button.

## Usage

```es6
import ActionPanel from 'components/action-panel';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelFooter from 'components/action-panel/footer';
import Button from 'components/button';

const ActionPanelExample = ( { translate }) => {
  return (
      <ActionPanel>
        <ActionPanelBody>
          <ActionPanelFigure inlineBodyText={ true }>
            <img
              src="/calypso/images/wordpress/logo-stars.svg"
              width="170"
              height="143"
              alt="WordPress logo"
            />
          </ActionPanelFigure>
          <ActionPanelTitle>Action panel title</ActionPanelTitle>
          <p>
            This is a description of the action. It gives a bit more detail and explains what we are
            inviting the user to do.
          </p>
        </ActionPanelBody>
        <ActionPanelFooter>
          <Button className="action-panel__support-button" href="/help/contact">
            Call to action!
          </Button>
        </ActionPanelFooter>
      </ActionPanel>
  );
}
```