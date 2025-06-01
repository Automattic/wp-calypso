import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';

export const NeedHelpLink = ( { onHelpLinkClicked }: { onHelpLinkClicked: () => void } ) => {
	return (
		<span className="site-migration-credentials__need-help-link">
			{ translate( 'Need help? {{button}}Let us guide you{{/button}}', {
				components: {
					button: <Button variant="link" onClick={ onHelpLinkClicked } type="button" />,
				},
			} ) }
		</span>
	);
};
