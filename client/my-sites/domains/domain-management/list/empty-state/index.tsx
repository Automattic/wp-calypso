import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { __experimentalText as Text, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

export default function EmptyState() {
	const translate = useTranslate();

	const handleClickUseMyDomain = () => {
		recordTracksEvent( 'calypso_domain_management_list_empty_state_use_my_domain_click' );
		page( '/setup/domain-transfer' );
	};

	const handleClickAddNewDomain = () => {
		recordTracksEvent( 'calypso_domain_management_list_empty_state_add_new_domain_click' );
		page( '/start/domain' );
	};

	return (
		<div className="domains-empty-state">
			<Text as="p">
				{ translate(
					"Enhance your brand credibility with a custom domain, free for the first year on WordPress.com annual plans. Seamlessly manage your site and domain, or transfer your existing domain effortlessly. Let's get started."
				) }
			</Text>
			<div className="domains-empty-state-actions">
				<Button __next40pxDefaultSize variant="secondary" onClick={ handleClickUseMyDomain }>
					{ translate( 'Transfer domain' ) }
				</Button>
				<Button __next40pxDefaultSize variant="primary" onClick={ handleClickAddNewDomain }>
					{ translate( 'Find a domain' ) }
				</Button>
			</div>
		</div>
	);
}
