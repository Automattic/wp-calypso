import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { getSiteWooCommerceUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { GoToStep } from '../../types';
import type { AppState } from 'calypso/types';
import type { ReactElement } from 'react';
interface Props {
	goToStep: GoToStep;
}

export default function Complete( { goToStep }: Props ): ReactElement | null {
	const { __ } = useI18n();

	const siteId = useSelector( getSelectedSiteId ) as number;

	const wcAdmin =
		useSelector( ( state: AppState ) => getSiteWooCommerceUrl( state, siteId ) ) ?? '/';

	return (
		<>
			<div className="woocommerce-install__heading-wrapper">
				<div className="woocommerce-install__heading">
					<Title>{ __( 'Setup complete' ) }</Title>
					<SubTitle></SubTitle>

					<div className="woocommerce-install__buttons-group">
						<div>
							<BackButton onClick={ () => goToStep( 'confirm' ) } />
						</div>
					</div>
				</div>
			</div>
			<div className="woocommerce-install__content">
				<div>
					<NextButton onClick={ () => ( window.location.href = wcAdmin ) }>
						{ __( 'Finish' ) }
					</NextButton>
				</div>
			</div>
		</>
	);
}
