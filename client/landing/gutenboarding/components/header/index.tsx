/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { Icon, wordpress } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import DomainPickerButton from '../domain-picker-button';
import PlansButton from '../plans-button';
import { useCurrentStep } from '../../path';

/**
 * Style dependencies
 */
import './style.scss';

const Header: React.FunctionComponent = () => {
	const { __ } = useI18n();

	const currentStep = useCurrentStep();

	const { domain, siteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );

	const { setDomain } = useDispatch( ONBOARD_STORE );

	React.useEffect( () => {
		if ( ! siteTitle ) {
			setDomain( undefined );
		}
	}, [ siteTitle, setDomain ] );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	const domainElement = domain ? (
		domain.domain_name
	) : (
		<span className="gutenboarding__header-domain-picker-button-domain">
			{ __( 'Choose a domain' ) }
		</span>
	);

	const hideFullHeader = [
		'IntentGathering',
		'Domains',
		'DomainsModal',
		'Plans',
		'PlansModal',
	].includes( currentStep );

	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ __( 'Top bar' ) }
			tabIndex={ -1 }
		>
			<section
				className={ classnames( 'gutenboarding__header-section', {
					'gutenboarding__header-section--compact': hideFullHeader,
				} ) }
			>
				<div className="gutenboarding__header-section-item">
					<div className="gutenboarding__header-wp-logo">
						<Icon icon={ wordpress } size={ 28 } />
					</div>
				</div>
				<div className="gutenboarding__header-section-item gutenboarding__header-site-title-section">
					<div className="gutenboarding__header-site-title">
						{ siteTitle ? siteTitle : __( 'Start your website' ) }
					</div>
				</div>
				<div className="gutenboarding__header-section-item gutenboarding__header-domain-section">
					{
						// We display the DomainPickerButton as soon as we have a domain suggestion,
						// unless we're still at the IntentGathering step. In that case, we only
						// show it comes from a site title (but hide it if it comes from a vertical).
						domainElement && (
							<div
								className={ classnames( 'gutenboarding__header-domain-picker-button-container', {
									'no-domain': ! domain,
								} ) }
							>
								<DomainPickerButton className="gutenboarding__header-domain-picker-button">
									{ domainElement }
								</DomainPickerButton>
							</div>
						)
					}
				</div>
				<div className="gutenboarding__header-section-item gutenboarding__header-plan-section gutenboarding__header-section-item--right">
					<PlansButton />
				</div>
			</section>
		</div>
	);
};

export default Header;
