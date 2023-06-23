import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter, HelpCenterSelect } from '@automattic/data-stores';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDataStoreSelect,
} from '@wordpress/data';
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
		text-decoration: underline;
	}
`;

export function DefaultMasterbarContact() {
	const translate = useTranslate();

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

	return (
		<ContactContainer>
			<label>{ translate( 'Need extra help?' ) }</label>&nbsp;
			<Button className="marketplace-thank-you-help-center" isLink onClick={ toggleHelpCenter }>
				{ translate( 'Visit Help Center' ) }
			</Button>
		</ContactContainer>
	);
}
