/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelTitle from 'calypso/components/action-panel/title';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import ActionPanelCta from 'calypso/components/action-panel/cta';
import ActionPanelFooter from 'calypso/components/action-panel/footer';
import { Button } from '@automattic/components';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const ActionPanelExample = () => (
	<div className="design-assets__group">
		<div>
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
		</div>
		<div>
			<ActionPanel>
				<ActionPanelBody>
					<ActionPanelFigure inlineBodyText={ true } align="left">
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
	</div>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

ActionPanelExample.displayName = 'ActionPanel';

export default ActionPanelExample;
