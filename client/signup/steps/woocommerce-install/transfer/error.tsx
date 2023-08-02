import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'calypso/state';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SupportCard from '../components/support-card';
import StepContent from './step-content';

const WarningsOrHoldsSection = styled.div`
	margin-top: 40px;
`;

export default function Error() {
	const { __ } = useI18n();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	return (
		<StepContent
			title={ __( "We've hit a snag" ) }
			subtitle={ __(
				'It looks like something went wrong while setting up your store. Please contact support so that we can help you out.'
			) }
		>
			<WarningsOrHoldsSection>
				<SupportCard backUrl={ `/woocommerce-installation/${ domain }` } />
			</WarningsOrHoldsSection>
		</StepContent>
	);
}
