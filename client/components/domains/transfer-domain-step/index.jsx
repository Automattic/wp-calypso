/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { endsWith, get, isEmpty, noop } from 'lodash';
import Gridicon from 'gridicons';
import page from 'page';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import {
	checkAuthCode,
	checkDomainAvailability,
	checkInboundTransferStatus,
	getDomainPrice,
	getDomainProductSlug,
	getFixedDomainSearch,
	getTld,
	startInboundTransfer,
} from 'lib/domains';
import { getProductsList } from 'state/products-list/selectors';
import { domainAvailability } from 'lib/domains/constants';
import { getAvailabilityNotice } from 'lib/domains/registration/availability-messages';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import { getCurrentUser, getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import Notice from 'components/notice';
import Card from 'components/card';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import TransferDomainPrecheck from './transfer-domain-precheck';
import { CALYPSO_CONTACT, INCOMING_DOMAIN_TRANSFER, MAP_EXISTING_DOMAIN } from 'lib/url/support';
import HeaderCake from 'components/header-cake';
import Button from 'components/button';
import TransferRestrictionMessage from 'components/domains/transfer-domain-step/transfer-restriction-message';
import { fetchDomains } from 'lib/upgrades/actions';
import { domainManagementTransferIn } from 'my-sites/domains/paths';
import { errorNotice } from 'state/notices/actions';
import QueryProducts from 'components/data/query-products-list';
import { isPlan } from 'lib/products-values';
import { isDomainBundledWithPlan, isNextDomainFree } from 'lib/cart-values/cart-items';

class TransferDomainStep extends React.Component {
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
			transferSelected: false,
		};
	}

	componentWillMount() {
		if ( this.props.initialState ) {
			this.setState( Object.assign( {}, this.props.initialState, this.getDefaultState() ) );
		}

		if ( this.props.forcePrecheck && isEmpty( this.inboundTransferStatus ) ) {
			this.getInboundTransferStatus();
		}
	}

	componentWillUnmount() {
		this.props.onSave( this.state );
	}

	notice() {
		if ( this.state.notice ) {
			return (
				<Notice
					text={ this.state.notice }
					status={ `is-${ this.state.noticeSeverity }` }
					showDismiss={ false }
				/>
			);
		}
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

	addTransfer() {
		const { translate } = this.props;
		const { searchQuery, submittingAvailability, submittingWhois } = this.state;
		const submitting = submittingAvailability || submittingWhois;
		const domainProductPrice = this.getProductPriceText();

		return (
			<div>
				<QueryProducts />
				{ this.notice() }
				<form className="transfer-domain-step__form card" onSubmit={ this.handleFormSubmit }>
					<div className="transfer-domain-step__domain-description">
						<div className="transfer-domain-step__domain-heading">
							{ translate( 'Manage your domain and site together on WordPress.com.' ) }
						</div>
						<div>
							{ translate(
								'Transfer your domain away from your current provider to WordPress.com so you can update settings, ' +
									"renew your domain, and more \u2013 right in your dashboard. We'll renew it for another year " +
									'when the transfer is successful. {{a}}Learn more{{/a}}.',
								{
									components: {
										a: (
											<a
												href={ INCOMING_DOMAIN_TRANSFER }
												rel="noopener noreferrer"
												target="_blank"
											/>
										),
									},
								}
							) }
						</div>
					</div>

					<div className="transfer-domain-step__add-domain" role="group">
						<FormTextInputWithAffixes
							prefix="http://"
							type="text"
							value={ searchQuery }
							placeholder={ translate( 'example.com' ) }
							onBlur={ this.save }
							onChange={ this.setSearchQuery }
							onFocus={ this.recordInputFocus }
							suffix={ domainProductPrice }
							autoFocus
						/>
					</div>
					<Button
						disabled={ ! getTld( searchQuery ) || submitting }
						busy={ submitting }
						className="transfer-domain-step__go button is-primary"
						onClick={ this.handleFormSubmit }
					>
						{ translate( 'Transfer to WordPress.com' ) }
					</Button>
					{ this.domainRegistrationUpsell() }
				</form>
			</div>
		);
	}

	startPendingInboundTransfer = ( domain, authCode ) => {
		const { selectedSite, translate } = this.props;

		startInboundTransfer( selectedSite.ID, domain, authCode, ( error, result ) => {
			if ( result ) {
				fetchDomains( domain );
				page( domainManagementTransferIn( selectedSite.slug, domain ) );
			} else {
				this.props.errorNotice( translate( 'We were unable to start the transfer.' ) );
			}
		} );
	};

	getTransferDomainPrecheck() {
		const {
			authCodeValid,
			domain,
			inboundTransferStatus,
			submittingAuthCodeCheck,
			submittingWhois,
			searchQuery,
		} = this.state;

		const onSetValid = this.props.forcePrecheck
			? this.startPendingInboundTransfer
			: this.props.onTransferDomain;

		return (
			<TransferDomainPrecheck
				authCodeValid={ authCodeValid }
				checkAuthCode={ this.getAuthCodeStatus }
				domain={ domain || searchQuery }
				loading={ submittingWhois || submittingAuthCodeCheck }
				losingRegistrar={ inboundTransferStatus.losingRegistrar }
				losingRegistrarIanaId={ inboundTransferStatus.losingRegistrarIanaId }
				refreshStatus={ this.getInboundTransferStatus }
				selectedSiteSlug={ get( this.props, 'selectedSite.slug', null ) }
				setValid={ onSetValid }
				supportsPrivacy={ this.state.supportsPrivacy }
				unlocked={ inboundTransferStatus.unlocked }
			/>
		);
	}

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
		if ( this.state.domain ) {
			this.setState( {
				domain: null,
				inboundTransferStatus: {},
				precheck: false,
				supportsPrivacy: false,
			} );
		} else {
			this.props.goBack();
		}
	};

	getProductPriceText = () => {
		const {
			cart,
			currencyCode,
			translate,
			domainsWithPlansOnly,
			isSignupStep,
			productsList,
			selectedSite,
		} = this.props;
		const { searchQuery } = this.state;
		const productSlug = getDomainProductSlug( searchQuery );
		const domainsWithPlansOnlyButNoPlan =
			domainsWithPlansOnly && ( ( selectedSite && ! isPlan( selectedSite.plan ) ) || isSignupStep );

		let domainProductPrice = getDomainPrice( productSlug, productsList, currencyCode );

		if ( isNextDomainFree( cart ) || isDomainBundledWithPlan( cart, searchQuery ) ) {
			domainProductPrice = translate( 'Free with your plan' );
		} else if ( domainsWithPlansOnlyButNoPlan ) {
			domainProductPrice = translate( 'Included in paid plans' );
		}

		return domainProductPrice;
	};

	renderIllustration = image => {
		return (
			<div className="use-your-domain__option-illustration">
				<img src={ image } alt="" />
			</div>
		);
	};

	renderOptionTitle = optionTitle => {
		return <h3 className="use-your-domain__option-title">{ optionTitle }</h3>;
	};

	renderOptionReasons = optionReasons => {
		return (
			<div className="use-your-domain__option-reasons">
				{ optionReasons.map( ( phrase, index ) => {
					if ( isEmpty( phrase ) ) {
						return;
					}

					return (
						<div className="use-your-domain__option-reason" key={ index }>
							<Gridicon icon="checkmark" size={ 18 } />
							{ phrase }
						</div>
					);
				} ) }
			</div>
		);
	};

	renderOptionContent = content => {
		const { image, title, reasons, onClick, buttonText, isPrimary, learnMore } = content;
		return (
			<Card className="use-your-domain__option" compact>
				<div className="use-your-domain__option-inner-wrap">
					<div className="use-your-domain__option-content">
						{ this.renderIllustration( image ) }
						{ this.renderOptionTitle( title ) }
						{ this.renderOptionReasons( reasons ) }
					</div>
					<div className="use-your-domain__option-action">
						{ this.renderOptionButton( { onClick, buttonText, isPrimary } ) }
						<div className="use-your-domain__learn-more">{ learnMore }</div>
					</div>
				</div>
			</Card>
		);
	};

	renderOptionButton = buttonOptions => {
		const { buttonText, onClick, isPrimary } = buttonOptions;
		const { submittingAvailability, submittingWhois } = this.state;
		const submitting = submittingAvailability || submittingWhois;
		return (
			<Button
				className="use-your-domain__option-button"
				primary={ isPrimary }
				onClick={ onClick }
				busy={ submitting }
			>
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
			this.getProductPriceText(),
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
			onClick: this.handleFormSubmit,
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
			onClick: this.goToMapDomainStep,
			buttonText,
			isPrimary: false,
			learnMore,
		} );
	};

	useYourDomain = () => {
		const { translate } = this.props;

		return (
			<div>
				<QueryProducts />
				<div className="use-your-domain__content">
					{ this.renderSelectTransfer() }
					{ this.renderSelectMapping() }
				</div>
				<p className="use-your-domain__footer">
					{ translate( "Not sure what works best for you? {{a}}We're happy to help!{{/a}}", {
						components: {
							a: <a href={ CALYPSO_CONTACT } />,
						},
					} ) }
				</p>
			</div>
		);
	};

	render() {
		let content;
		const { precheck, transferSelected } = this.state;
		const { isSignupStep } = this.props;
		const transferIsRestricted = this.transferIsRestricted();

		if ( transferSelected && transferIsRestricted ) {
			content = this.getTransferRestrictionMessage();
		} else if ( precheck && ! isSignupStep ) {
			content = this.getTransferDomainPrecheck();
		} else if ( transferSelected ) {
			content = this.addTransfer();
		} else {
			content = this.useYourDomain();
		}

		const header = ! isSignupStep && (
			<HeaderCake onClick={ this.goBack }>
				{ this.props.translate( 'Use My Own Domain' ) }
			</HeaderCake>
		);

		return (
			<div className="use-your-domain">
				{ header }
				{ content }
			</div>
		);
	}

	domainRegistrationUpsell() {
		const { suggestion } = this.state;
		const { onRegisterDomain } = this.props;
		if ( ! suggestion || ! onRegisterDomain ) {
			return;
		}

		return (
			<div className={ 'transfer-domain-step__domain-availability' }>
				<Notice status="is-success" showDismiss={ false }>
					{ this.props.translate( '%(domain)s is available!', {
						args: { domain: suggestion.domain_name },
					} ) }
				</Notice>
				<DomainRegistrationSuggestion
					cart={ this.props.cart }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					key={ suggestion.domain_name }
					onButtonClick={ this.registerSuggestedDomain }
					selectedSite={ this.props.selectedSite }
					suggestion={ suggestion }
				/>
			</div>
		);
	}

	registerSuggestedDomain = () => {
		this.props.recordAddDomainButtonClickInTransferDomain(
			this.state.suggestion.domain_name,
			this.props.analyticsSection
		);

		return this.props.onRegisterDomain( this.state.suggestion );
	};

	recordInputFocus = () => {
		this.props.recordInputFocusInTransferDomain( this.state.searchQuery );
	};

	setSearchQuery = event => {
		this.setState( { searchQuery: event.target.value } );
	};

	handleFormSubmit = event => {
		event.preventDefault();

		const { analyticsSection, searchQuery } = this.state;

		if ( isEmpty( searchQuery ) ) {
			this.setState( { transferSelected: true } );
			return;
		}

		const domain = getFixedDomainSearch( searchQuery );
		this.props.recordFormSubmitInTransferDomain( searchQuery );
		this.setState( { notice: null, suggestion: null, submittingAvailability: true } );

		this.props.recordGoButtonClickInTransferDomain( searchQuery, analyticsSection );

		Promise.all( [ this.getInboundTransferStatus(), this.getAvailability() ] ).then( () => {
			this.setState( prevState => {
				const { submittingAvailability, submittingWhois } = prevState;

				return { precheck: prevState.domain && ! submittingAvailability && ! submittingWhois };
			} );

			if ( this.props.isSignupStep && this.state.domain && ! this.transferIsRestricted() ) {
				this.props.onTransferDomain( domain );
			}
		} );
	};

	getAvailability = () => {
		const domain = getFixedDomainSearch( this.state.searchQuery );

		return new Promise( resolve => {
			checkDomainAvailability(
				{ domainName: domain, blogId: get( this.props, 'selectedSite.ID', null ) },
				( error, result ) => {
					const status = get( result, 'status', error );
					switch ( status ) {
						case domainAvailability.AVAILABLE:
							this.setState( { suggestion: result } );
							break;
						case domainAvailability.TRANSFERRABLE:
						case domainAvailability.MAPPED_SAME_SITE_TRANSFERRABLE:
							this.setState( {
								domain,
								supportsPrivacy: get( result, 'supports_privacy', false ),
							} );
							break;
						case domainAvailability.MAPPABLE:
						case domainAvailability.TLD_NOT_SUPPORTED:
						case domainAvailability.TLD_NOT_SUPPORTED_TEMPORARILY:
							const tld = getTld( domain );

							this.setState( {
								notice: this.props.translate(
									"We don't support transfers for domains ending with {{strong}}.%(tld)s{{/strong}}, " +
										'but you can {{a}}map it{{/a}} instead.',
									{
										args: { tld },
										components: {
											strong: <strong />,
											a: <a href="#" onClick={ this.goToMapDomainStep } />,
										},
									}
								),
								noticeSeverity: 'info',
							} );
							break;
						case domainAvailability.UNKNOWN:
							const mappableStatus = get( result, 'mappable', error );

							if ( domainAvailability.MAPPABLE === mappableStatus ) {
								this.setState( {
									notice: this.props.translate(
										"{{strong}}%(domain)s{{/strong}} can't be transferred. " +
											'You can {{a}}manually connect it{{/a}} if you still want to use it for your site.',
										{
											args: { domain },
											components: {
												strong: <strong />,
												a: <a href="#" onClick={ this.goToMapDomainStep } />,
											},
										}
									),
									noticeSeverity: 'info',
								} );
								break;
							}
						default:
							let site = get( result, 'other_site_domain', null );
							if ( ! site ) {
								site = get( this.props, 'selectedSite.slug', null );
							}

							const maintenanceEndTime = get( result, 'maintenance_end_time', null );
							const { message, severity } = getAvailabilityNotice( domain, status, {
								site,
								maintenanceEndTime,
							} );
							this.setState( { notice: message, noticeSeverity: severity } );
					}

					this.setState( { submittingAvailability: false } );
					resolve();
				}
			);
		} );
	};

	getInboundTransferStatus = () => {
		this.setState( { submittingWhois: true } );

		return new Promise( resolve => {
			checkInboundTransferStatus(
				getFixedDomainSearch( this.state.searchQuery ),
				( error, result ) => {
					this.setState( { submittingWhois: false } );

					if ( ! isEmpty( error ) ) {
						resolve();
						return;
					}

					this.setState( {
						inboundTransferStatus: {
							creationDate: result.creation_date,
							email: result.admin_email,
							loading: false,
							losingRegistrar: result.registrar,
							losingRegistrarIanaId: result.registrar_iana_id,
							privacy: result.privacy,
							termMaximumInYears: result.term_maximum_in_years,
							transferEligibleDate: result.transfer_eligible_date,
							transferRestrictionStatus: result.transfer_restriction_status,
							unlocked: result.unlocked,
						},
					} );
					resolve();
				}
			);
		} );
	};

	getAuthCodeStatus = ( domain, authCode ) => {
		this.setState( { submittingAuthCodeCheck: true } );

		return new Promise( resolve => {
			checkAuthCode( domain, authCode, ( error, result ) => {
				this.setState( { submittingAuthCodeCheck: false } );

				if ( ! isEmpty( error ) ) {
					resolve();
					return;
				}

				this.setState( {
					authCodeValid: result.success,
				} );
				resolve();
			} );
		} );
	};
}

const recordAddDomainButtonClickInTransferDomain = ( domain_name, section ) =>
	recordTracksEvent( 'calypso_transfer_domain_add_suggested_domain_click', {
		domain_name,
		section,
	} );

const recordFormSubmitInTransferDomain = domain_name =>
	recordTracksEvent( 'calypso_transfer_domain_form_submit', { domain_name } );

const recordInputFocusInTransferDomain = domain_name =>
	recordTracksEvent( 'calypso_transfer_domain_input_focus', { domain_name } );

const recordGoButtonClickInTransferDomain = ( domain_name, section ) =>
	recordTracksEvent( 'calypso_transfer_domain_go_click', { domain_name, section } );

const recordMapDomainButtonClick = section =>
	composeAnalytics(
		recordGoogleEvent( 'Transfer Domain', 'Clicked "Map it" Button' ),
		recordTracksEvent( 'calypso_transfer_domain_mapping_button_click', { section } )
	);

export default connect(
	state => ( {
		currentUser: getCurrentUser( state ),
		currencyCode: getCurrentUserCurrencyCode( state ),
		selectedSite: getSelectedSite( state ),
		productsList: getProductsList( state ),
	} ),
	{
		errorNotice,
		recordAddDomainButtonClickInTransferDomain,
		recordFormSubmitInTransferDomain,
		recordInputFocusInTransferDomain,
		recordGoButtonClickInTransferDomain,
		recordMapDomainButtonClick,
	}
)( localize( TransferDomainStep ) );
