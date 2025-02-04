import page from '@automattic/calypso-router';
import { Button, FoldableCard, MaterialIcon } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { Icon, chevronDown, chevronUp, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import {
	modeType,
	stepsHeading,
	stepSlug,
} from 'calypso/components/domains/connect-domain-step/constants';
import { domainManagementDns } from 'calypso/my-sites/domains/paths';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';

import './style.scss';

export default function ConnectDomainStepSuggestedStart( {
	className,
	domain,
	pageSlug,
	mode,
	onNextStep,
	progressStepList,
	setPage,
	domainSetupInfo,
} ) {
	const { __ } = useI18n();
	const { data } = domainSetupInfo;
	const selectedSite = useSelector( getSelectedSite );
	const goToDnsRecordsPage = () => page( domainManagementDns( selectedSite?.slug, domain ) );
	const firstStep = data?.is_subdomain
		? stepSlug.SUBDOMAIN_ADVANCED_START
		: stepSlug.ADVANCED_START;
	const switchToAdvancedSetup = () => setPage( firstStep );

	const message = data?.is_subdomain
		? __(
				'The easiest way to connect your subdomain is by changing NS records. But if you are unable to do this, then switch to our <a>advanced setup</a>, using A & CNAME records.'
		  )
		: __(
				'This is the easiest way to connect your domain, using name servers. If needed you can also use our <a>advanced setup</a>, using root A & CNAME records.'
		  );

	const stepContent = (
		<div className={ className + '__suggested-start' }>
			<p className={ className + '__text' }>
				{ createInterpolateElement( message, {
					a: createElement( 'a', {
						className: 'connect-domain-step__change_mode_link',
						onClick: switchToAdvancedSetup,
					} ),
				} ) }
			</p>
			<CardHeading tagName="h2" className={ className + '__sub-heading' }>
				<MaterialIcon className={ className + '__sub-heading-icon' } size={ 24 } icon="timer" />
				{ __( 'How long will it take?' ) }
			</CardHeading>
			<p className={ className + '__text' }>
				{ __( 'It takes 5-15 minutes to set up.' ) }
				<br />
				{ __( 'It can take up to 72 hours for the domain to be fully connected.' ) }
			</p>
			<FoldableCard
				clickableHeader
				className={ className + '__connected-services-card' }
				header={
					<div>
						<Icon icon={ info } size={ 24 } />
						{ __( 'Do you have email or other services connected to this domain?' ) }
					</div>
				}
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				actionButton={
					<button className="foldable-card__action foldable-card__expand">
						<span className="screen-reader-text">More</span>
						<Icon icon={ chevronDown } viewBox="6 4 12 14" size={ 16 } />
					</button>
				}
				actionButtonExpanded={
					<button className="foldable-card__action foldable-card__expand">
						<span className="screen-reader-text">More</span>
						<Icon icon={ chevronUp } viewBox="6 4 12 14" size={ 16 } />
					</button>
				}
				/* eslint-enable wpcalypso/jsx-classname-namespace */
				expanded={ false }
			>
				<p>
					{ createInterpolateElement(
						__(
							'If you have any email or services other than web hosting connected to this domain, we recommend you copy over your DNS records before proceeding with this setup to avoid disruptions. You can then start the setup again by going back to <em>Upgrades > Domains</em>.'
						),
						{
							em: createElement( 'em' ),
						}
					) }
				</p>
				<Button onClick={ goToDnsRecordsPage }>{ __( 'Go to DNS records' ) }</Button>
				<p>
					{ __(
						'Alternatively, you can continue to use your current DNS provider by adding the correct A records and CNAME records using our advanced setup.'
					) }
				</p>
				<Button onClick={ switchToAdvancedSetup }>{ __( 'Switch to advanced setup' ) }</Button>
			</FoldableCard>
			<Button primary onClick={ onNextStep }>
				{ __( 'Start setup' ) }
			</Button>
		</div>
	);

	return (
		<ConnectDomainStepWrapper
			className={ className }
			heading={ stepsHeading.SUGGESTED }
			mode={ mode }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			stepContent={ stepContent }
		/>
	);
}

ConnectDomainStepSuggestedStart.propTypes = {
	className: PropTypes.string.isRequired,
	pageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	onNextStep: PropTypes.func.isRequired,
	progressStepList: PropTypes.object.isRequired,
	setPage: PropTypes.func.isRequired,
	domainSetupInfo: PropTypes.object.isRequired,
};
