# Action Panel

This is a larger [`Card` component](../../components/card) that has a title, description, right-aligned figure and call-to-action button.

## Usage

```jsx
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelTitle from 'calypso/components/action-panel/title';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import ActionPanelCta from 'calypso/components/action-panel/cta';
import ActionPanelFooter from 'calypso/components/action-panel/footer';
import { Button } from '@automattic/components';

const ActionPanelExample = ( { translate } ) => {
	return (
		<div>
			<ActionPanel>
				<ActionPanelBody>
					<ActionPanelFigure inlineBodyText>
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
			<ActionPanel>
				<ActionPanelBody>
					<ActionPanelFigure inlineBodyText align="left">
						<img
							src="/calypso/images/wordpress/logo-stars.svg"
							width="170"
							height="143"
							alt="WordPress logo"
						/>
					</ActionPanelFigure>
					<ActionPanelTitle>Action panel with left aligned image</ActionPanelTitle>
					<p>
						This is a description of the action. It gives a bit more detail and explains what we are
						inviting the user to do.
					</p>
					<ActionPanelCta>
						<Button className="action-panel__support-button" href="/help/contact">
							Call to action!
						</Button>
					</ActionPanelCta>
				</ActionPanelBody>
			</ActionPanel>
		</div>
	);
};
```
