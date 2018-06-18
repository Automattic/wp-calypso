/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { endsWith, get, noop } from 'lodash';
import Gridicon from 'gridicons';
import page from 'page';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { getProductsList } from 'state/products-list/selectors';
import { getCurrentUser, getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import Card from 'components/card';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';
import { CALYPSO_CONTACT, INCOMING_DOMAIN_TRANSFER, MAP_EXISTING_DOMAIN } from 'lib/url/support';
import HeaderCake from 'components/header-cake';
import Button from 'components/button';
import TransferRestrictionMessage from 'components/domains/transfer-domain-step/transfer-restriction-message';
import { errorNotice } from 'state/notices/actions';

class UseMyDomain extends React.Component {
	static propTypes = {
		analyticsSection: PropTypes.string.isRequired,
		basePath: PropTypes.string,
		cart: PropTypes.object,
		domainsWithPlansOnly: PropTypes.bool,
		goBack: PropTypes.func,
		initialQuery: PropTypes.string,
		isSignupStep: PropTypes.bool,
		mapDomainUrl: PropTypes.string,
		onRegisterDomain: PropTypes.func,
		onTransferDomain: PropTypes.func,
		onSave: PropTypes.func,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		forcePrecheck: PropTypes.bool,
	};

	static defaultProps = {
		analyticsSection: 'domains',
		onSave: noop,
	};

	state = this.getDefaultState();

	getDefaultState() {
		return {
			authCodeValid: null,
			domain: null,
			domainsWithPlansOnly: false,
			inboundTransferStatus: {},
			precheck: get( this.props, 'forcePrecheck', false ),
			searchQuery: this.props.initialQuery || '',
			submittingAuthCodeCheck: false,
			submittingAvailability: false,
			submittingWhois: get( this.props, 'forcePrecheck', false ),
			supportsPrivacy: false,
		};
	}

	getMapDomainUrl() {
		const { basePath, mapDomainUrl, selectedSite } = this.props;
		if ( mapDomainUrl ) {
			return mapDomainUrl;
		}

		let buildMapDomainUrl;
		const basePathForMapping = endsWith( basePath, '/transfer' )
			? basePath.substring( 0, basePath.length - 9 )
			: basePath;

		buildMapDomainUrl = `${ basePathForMapping }/mapping`;
		if ( selectedSite ) {
			const query = stringify( { initialQuery: this.state.searchQuery.trim() } );
			buildMapDomainUrl += `/${ selectedSite.slug }?${ query }`;
		}

		return buildMapDomainUrl;
	}

	goToMapDomainStep = event => {
		event.preventDefault();

		this.props.recordMapDomainButtonClick( this.props.analyticsSection );

		page( this.getMapDomainUrl() );
	};

	transferIsRestricted = () => {
		const { submittingAvailability, submittingWhois } = this.state;
		const submitting = submittingAvailability || submittingWhois;
		const transferRestrictionStatus = get(
			this.state,
			'inboundTransferStatus.transferRestrictionStatus',
			false
		);

		return (
			! submitting && transferRestrictionStatus && 'not_restricted' !== transferRestrictionStatus
		);
	};

	getTransferRestrictionMessage() {
		const { domain, inboundTransferStatus } = this.state;
		const {
			creationDate,
			termMaximumInYears,
			transferEligibleDate,
			transferRestrictionStatus,
		} = inboundTransferStatus;

		return (
			<TransferRestrictionMessage
				basePath={ this.props.basePath }
				creationDate={ creationDate }
				domain={ domain }
				goBack={ this.goBack }
				mapDomainUrl={ this.getMapDomainUrl() }
				selectedSiteSlug={ get( this.props, 'selectedSite.slug', null ) }
				termMaximumInYears={ termMaximumInYears }
				transferEligibleDate={ transferEligibleDate }
				transferRestrictionStatus={ transferRestrictionStatus }
			/>
		);
	}

	goBack = () => {
		this.props.goBack();
	};

	renderIllustration = image => {
		return (
			<div className="use-my-domain__option-illustration">
				<img src={ image } alt="" />
			</div>
		);
	};

	renderOptionTitle = optionTitle => {
		return <h3 className="use-my-domain__option-title">{ optionTitle }</h3>;
	};

	renderOptionReasons = optionReasons => {
		return (
			<div className="use-my-domain__option-reasons">
				{ optionReasons.map( ( phrase, index ) => (
					<div className="use-my-domain__option-reason" key={ index }>
						<Gridicon icon="checkmark" size={ 18 } />
						{ phrase }
					</div>
				) ) }
			</div>
		);
	};

	renderOptionContent = content => {
		const { image, title, reasons, onClick, buttonText, isPrimary, learnMore } = content;
		return (
			<Card className={ 'use-my-domain__option' } compact>
				<div className="use-my-domain__option-content">
					{ this.renderIllustration( image ) }
					{ this.renderOptionTitle( title ) }
					{ this.renderOptionReasons( reasons ) }
				</div>
				{ this.renderOptionButton( { onClick, buttonText, isPrimary } ) }
				<div className="use-my-domain__learn-more">{ learnMore }</div>
			</Card>
		);
	};

	renderOptionButton = buttonOptions => {
		const { buttonText, onClick, isPrimary } = buttonOptions;
		return (
			<Button className="use-my-domain__option-action" primary={ isPrimary } onClick={ onClick }>
				{ buttonText }
			</Button>
		);
	};

	renderSelectTransfer = () => {
		const { translate } = this.props;
		const image = '/calypso/images/illustrations/migrating-host-diy.svg';
		const title = translate( 'Transfer your domain away from your current registrar.' );
		const reasons = [
			translate( 'Manage domain settings in your WordPress.com dashboard' ),
			translate( 'Extends registration by 1 year' ),
			translate( 'Can take several days to transfer' ),
		];
		const buttonText = translate( 'Transfer to WordPress.com' );
		const learnMore = translate( '{{a}}Learn more about domain transfers{{/a}}', {
			components: {
				a: <a href={ INCOMING_DOMAIN_TRANSFER } />,
			},
		} );

		return this.renderOptionContent( {
			image,
			title,
			reasons,
			onClick: noop,
			buttonText,
			isPrimary: true,
			learnMore,
		} );
	};

	renderSelectMapping = () => {
		const { translate } = this.props;
		const image = '/calypso/images/illustrations/jetpack-themes.svg';
		const title = translate( 'Map your domain without moving it from your current registrar.' );
		const reasons = [
			translate( 'Manage domain settings at your current domain provider' ),
			translate( 'Additional costs' ),
			translate( 'Limited waiting period for changes' ),
		];
		const buttonText = translate( 'Buy Domain Mapping' );
		const learnMore = translate( '{{a}}Learn more about domain mapping{{/a}}', {
			components: {
				a: <a href={ MAP_EXISTING_DOMAIN } />,
			},
		} );

		return this.renderOptionContent( {
			image,
			title,
			reasons,
			onClick: noop,
			buttonText,
			isPrimary: false,
			learnMore,
		} );
	};

	render() {
		const { isSignupStep, translate } = this.props;
		// const transferIsRestricted = this.transferIsRestricted();

		// if ( transferIsRestricted ) {
		// 	content = this.getTransferRestrictionMessage();
		// } else if ( precheck && ! isSignupStep ) {
		// 	content = this.getTransferDomainPrecheck();
		// } else {
		// 	content = this.addTransfer();
		// }

		const header = ! isSignupStep && (
			<HeaderCake onClick={ this.goBack }>
				{ this.props.translate( 'Use My Own Domain' ) }
			</HeaderCake>
		);

		return (
			<div className="use-my-domain">
				{ header }
				<div className="use-my-domain__content">
					{ this.renderSelectTransfer() }
					{ this.renderSelectMapping() }
				</div>
				<p className="use-my-domain__footer">
					{ translate( "Not sure what works best for you? {{a}}We're happy to help!{{/a}}", {
						components: {
							a: <a href={ CALYPSO_CONTACT } />,
						},
					} ) }
				</p>
			</div>
		);
	}
}

const recordTransferButtonClickInUserYourDomain = domain_name =>
	recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain_name } );

const recordMappingButtonClickInUserYourDomain = domain_name =>
	recordTracksEvent( 'calypso_use_your_domain_mapping_click', { domain_name } );

export default connect(
	state => ( {
		currentUser: getCurrentUser( state ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		selectedSite: getSelectedSite( state ),
		productsList: getProductsList( state ),
	} ),
	{
		errorNotice,
		recordTransferButtonClickInUserYourDomain,
		recordMappingButtonClickInUserYourDomain,
	}
)( localize( UseMyDomain ) );
