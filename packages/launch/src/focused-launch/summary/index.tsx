/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import { Title } from '@automattic/onboarding';
import { __ } from '@wordpress/i18n';
import { TextControl, SVG, Path, Tooltip, Circle, Rect } from '@wordpress/components';
import React, { ReactNode } from 'react';
import DomainPicker, { LockedPurchasedItem } from '@automattic/domain-picker';
import { Icon, check } from '@wordpress/icons';
import { Link } from 'react-router-dom';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Route } from '../route';
import { useTitle, useDomainSearch, useSiteDomains } from '../../hooks';
import { LAUNCH_STORE } from '../../stores';

import './style.scss';

const bulb = (
	<SVG viewBox="0 0 24 24">
		<Path d="M12 15.8c-3.7 0-6.8-3-6.8-6.8s3-6.8 6.8-6.8c3.7 0 6.8 3 6.8 6.8s-3.1 6.8-6.8 6.8zm0-12C9.1 3.8 6.8 6.1 6.8 9s2.4 5.2 5.2 5.2c2.9 0 5.2-2.4 5.2-5.2S14.9 3.8 12 3.8zM8 17.5h8V19H8zM10 20.5h4V22h-4z" />
	</SVG>
);

const info = (
	<SVG className="focused-launch-summary__info-icon" viewBox="0 0 24 24" width="16">
		<Circle cx="12" cy="12" stroke="#8C8F94" strokeWidth="2" r="10" fill="transparent" />
		<Rect x="10.5" y="5" width="3" height="3" fill="#8C8F94" />
		<Rect x="10.5" y="10" width="3" height="8" fill="#8C8F94" />
	</SVG>
);

type SummaryStepProps = {
	input: ReactNode;
	commentary?: ReactNode;
};

const SummaryStep: React.FunctionComponent< SummaryStepProps > = ( { input, commentary } ) => (
	<div className="focused-launch-summary__step">
		<div className="focused-launch-summary__data-input">
			<div className="focused-launch-summary__section">{ input }</div>
		</div>
		<div className="focused-launch-summary__side-commentary">{ commentary }</div>
	</div>
);

type CommonStepProps = {
	stepIndex: number;
};

// Props in common between all summary steps + a few props from <TextControl>
type SiteNameStepProps = CommonStepProps &
	Pick< React.ComponentProps< typeof TextControl >, 'value' | 'onChange' | 'onBlur' >;

const SiteNameStep: React.FunctionComponent< SiteNameStepProps > = ( {
	stepIndex,
	value,
	onChange,
	onBlur,
} ) => {
	return (
		<SummaryStep
			input={
				<TextControl
					className="focused-launch-summary__input"
					label={
						<label className="focused-launch-summary__label">
							{ stepIndex }. { __( 'Name your site', __i18n_text_domain__ ) }
						</label>
					}
					value={ value }
					onChange={ onChange }
					onBlur={ onBlur }
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus={ true }
				/>
			}
		/>
	);
};

// Props in common between all summary steps + a few props from <DomainPicker> +
// the remaining extra props
type DomainStepProps = CommonStepProps & { hasPaidDomain?: boolean } & Pick<
		React.ComponentProps< typeof DomainPicker >,
		| 'existingSubdomain'
		| 'currentDomain'
		| 'initialDomainSearch'
		| 'onDomainSelect'
		| 'onExistingSubdomainSelect'
	>;

const DomainStep: React.FunctionComponent< DomainStepProps > = ( {
	stepIndex,
	existingSubdomain,
	currentDomain,
	initialDomainSearch,
	hasPaidDomain,
	onDomainSelect,
	onExistingSubdomainSelect,
} ) => {
	return (
		<SummaryStep
			input={
				hasPaidDomain ? (
					<>
						<label className="focused-launch-summary__label">
							{ __( 'Your domain', __i18n_text_domain__ ) }
							<Tooltip
								position="top center"
								text={ __(
									'Changes to your purchased domain can be managed from your Domains page.',
									__i18n_text_domain__
								) }
							>
								{ info }
							</Tooltip>
						</label>
						<LockedPurchasedItem domainName={ currentDomain || '' } />
					</>
				) : (
					<>
						<DomainPicker
							header={
								<>
									<label className="focused-launch-summary__label">
										{ stepIndex }. { __( 'Confirm your domain', __i18n_text_domain__ ) }
									</label>
									<p className="focused-launch-summary__mobile-commentary focused-launch-summary__mobile-only">
										<Icon icon={ bulb } /> 46.9% of globally registered domains are .com
									</p>
								</>
							}
							existingSubdomain={ existingSubdomain }
							currentDomain={ currentDomain }
							onDomainSelect={ onDomainSelect }
							onExistingSubdomainSelect={ onExistingSubdomainSelect }
							initialDomainSearch={ initialDomainSearch }
							showSearchField={ false }
							analyticsFlowId="focused-launch"
							analyticsUiAlgo="focused_launch_domain_picker"
							quantity={ 3 }
							quantityExpanded={ 3 }
							itemType="individual-item"
						/>
						<Link to={ Route.DomainDetails }>
							{ __( 'View all domains', __i18n_text_domain__ ) }
						</Link>
					</>
				)
			}
			commentary={
				<>
					<p className="focused-launch-summary__side-commentary-title">
						<strong>46.9%</strong> of globally registered domains are <strong>.com</strong>
					</p>
					<ul className="focused-launch-summary__side-commentary-list">
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Stand out with a unique domain
						</li>
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Easy to remember and easy to share
						</li>
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Builds brand recognition and trust
						</li>
					</ul>
				</>
			}
		/>
	);
};

type PlanStepProps = CommonStepProps;

const PlanStep: React.FunctionComponent< PlanStepProps > = ( { stepIndex } ) => {
	return (
		<SummaryStep
			input={
				<>
					<label className="focused-launch-summary__label">
						{ stepIndex }. { __( 'Confirm your plan', __i18n_text_domain__ ) }
					</label>
					<p className="focused-launch-summary__mobile-commentary focused-launch-summary__mobile-only">
						<Icon icon={ bulb } /> Monetize your site with <strong>WordPress Premium</strong>
					</p>
					<Link to={ Route.PlanDetails }>{ __( 'View all plans', __i18n_text_domain__ ) }</Link>
				</>
			}
			commentary={
				<>
					<p className="focused-launch-summary__side-commentary-title">
						Monetize your site with <strong>WordPress Premium</strong>
					</p>
					<ul className="focused-launch-summary__side-commentary-list">
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Advanced tools and customization
						</li>
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Unlimited premium themes
						</li>
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Accept payments
						</li>
					</ul>
				</>
			}
		/>
	);
};

const Summary: React.FunctionComponent = () => {
	const { title, updateTitle, saveTitle } = useTitle();
	const { sitePrimaryDomain, siteSubdomain, hasPaidDomain } = useSiteDomains();
	const selectedDomain = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedDomain() );
	const { setDomain, unsetDomain } = useDispatch( LAUNCH_STORE );

	const domainSearch = useDomainSearch();

	// Prepare Steps
	const renderSiteNameStep = ( index: number ) => (
		<SiteNameStep
			stepIndex={ index }
			key={ index }
			value={ title }
			onChange={ updateTitle }
			onBlur={ saveTitle }
		/>
	);

	const renderDomainStep = ( index: number ) => (
		<DomainStep
			stepIndex={ index }
			key={ index }
			existingSubdomain={ siteSubdomain?.domain }
			currentDomain={ selectedDomain?.domain_name ?? sitePrimaryDomain?.domain }
			initialDomainSearch={ domainSearch }
			hasPaidDomain={ hasPaidDomain }
			onDomainSelect={ setDomain }
			/** NOTE: this makes the assumption that the user has a free domain,
			 * thus when they click the free domain, we just remove the value from the store
			 * this is a valid strategy in this context because they won't even see this step if
			 * they already have a paid domain
			 * */
			onExistingSubdomainSelect={ unsetDomain }
		/>
	);
	const renderPlanStep = ( index: number ) => <PlanStep stepIndex={ index } key={ index } />;

	// Steps that are not interactive (e.g. user has already selected domain/plan)
	// Steps that are not interactive (e.g. user has already selected domain/plan)
	const disabledSteps = hasPaidDomain ? [ renderDomainStep ] : [];

	// Steps that require the user interaction
	const activeSteps = hasPaidDomain
		? [ renderSiteNameStep, renderPlanStep ]
		: [ renderSiteNameStep, renderDomainStep, renderPlanStep ];

	return (
		<div className="focused-launch-summary__container">
			<div className="focused-launch-summary__section">
				<Title>{ __( "You're almost there", __i18n_text_domain__ ) }</Title>
				<p className="focused-launch-summary__caption">
					{ __(
						'Prepare for launch! Confirm a few final things before you take it live.',
						__i18n_text_domain__
					) }
				</p>
			</div>
			{ disabledSteps.map( ( step, stepIndex ) => step( stepIndex + 1 ) ) }
			{ activeSteps.map( ( step, stepIndex ) => step( stepIndex + 1 ) ) }
		</div>
	);
};

export default Summary;
