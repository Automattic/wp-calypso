import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter, HelpCenterSelect } from '@automattic/data-stores';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDataStoreSelect,
} from '@wordpress/data';
import { Icon, help } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

const HELP_CENTER_STORE = HelpCenter.register();

const ContactContainer = styled.div`
	margin-top: 24px;
	margin-right: 24px;
	font-size: 14px;
	line-height: 20px;
	font-weight: 500;

	label {
		color: var( --studio-gray-60 );
	}

	button.marketplace-thank-you-help-center {
		color: var( --studio-gray-100 );
		text-decoration: underline;
	}
`;

export function DefaultMasterbarContact() {
	const translate = useTranslate();
	const isDesktop = useDesktopBreakpoint();

	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );
	const isShowingHelpCenter = useDataStoreSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const toggleHelpCenter = () => {
		recordTracksEvent(
			`calypso_marketplace_thank_you_inlinehelp_${ isShowingHelpCenter ? 'close' : 'show' }`,
			{
				force_site_id: true,
				location: 'marketplace-thank-you-help-center',
			}
		);

		setShowHelpCenter( ! isShowingHelpCenter );
	};

	const content = isDesktop ? (
		<>
			<label>{ translate( 'Need extra help?' ) }</label>&nbsp;
			<Button className="marketplace-thank-you-help-center" isLink onClick={ toggleHelpCenter }>
				{ translate( 'Visit Help Center.' ) }
			</Button>
		</>
	) : (
		<>
			<Button className="marketplace-thank-you-help-center" isLink onClick={ toggleHelpCenter }>
				<Icon size={ 24 } icon={ help } />
			</Button>
		</>
	);

	return <ContactContainer>{ content }</ContactContainer>;
}
