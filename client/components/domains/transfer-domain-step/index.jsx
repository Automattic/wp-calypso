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
import qs from 'qs';

/**
 * Internal dependencies
 */
import { getFixedDomainSearch, checkDomainAvailability } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';
import { getAvailabilityNotice } from 'lib/domains/registration/availability-messages';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import { getCurrentUser } from 'state/current-user/selectors';
import {
	recordAddDomainButtonClickInMapDomain,
	recordFormSubmitInMapDomain,
	recordInputFocusInMapDomain,
	recordGoButtonClickInMapDomain,
} from 'state/domains/actions';
import Notice from 'components/notice';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import TransferDomainPrecheck from './transfer-domain-precheck';
import TransferDomainOptions from './transfer-domain-options';

class TransferDomainStep extends React.Component {
	static propTypes = {
		products: PropTypes.object.isRequired,
		cart: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		initialQuery: PropTypes.string,
		analyticsSection: PropTypes.string.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		onRegisterDomain: PropTypes.func.isRequired,
		onTransferDomain: PropTypes.func.isRequired,
		onSave: PropTypes.func,
	};

	static defaultProps = {
		onSave: noop,
		analyticsSection: 'domains',
	};

	state = this.getDefaultState();

	getDefaultState() {
		return {
			searchQuery: this.props.initialQuery || '',
			domain: null,
			optionPicker: false,
		};
	}

	componentWillMount() {
		if ( this.props.initialState ) {
			this.setState( Object.assign( {}, this.props.initialState, this.getDefaultState() ) );
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
		const { basePath, selectedSite } = this.props;
		let mapDomainUrl;

		const basePathForMapping = endsWith( basePath, '/transfer' )
			? basePath.substring( 0, basePath.length - 9 )
			: basePath;

		const query = qs.stringify( { initialQuery: this.state.searchQuery.trim() } );
		mapDomainUrl = `${ basePathForMapping }/mapping`;
		if ( selectedSite ) {
			mapDomainUrl += `/${ selectedSite.slug }?${ query }`;
		}

		return mapDomainUrl;
	}

	goToMapDomainStep = event => {
		event.preventDefault();

		this.props.recordMapDomainButtonClick( this.props.analyticsSection );

		page( this.getMapDomainUrl() );
	};

	addTransfer() {
		const cost = this.props.products.domain_map
			? this.props.products.domain_map.cost_display
			: null;
		const { translate } = this.props;

		return (
			<div>
				{ this.notice() }
				<form className="transfer-domain-step__form card" onSubmit={ this.handleFormSubmit }>
					<div className="transfer-domain-step__domain-description">
						<div className="transfer-domain-step__domain-heading">
							{ translate( 'Use your own domain for your WordPress.com site.' ) }
						</div>
						<div>
							{ translate(
								'Enter the domain you want to transfer to WordPress.com so you can manage your domain and site' +
									" all in one place. Domains purchases in the last 60 days can't be transferred. {{a}}Learn More{{/a}}",
								{
									components: { a: <a href="#" /> },
								}
							) }
						</div>
					</div>

					<div className="transfer-domain-step__add-domain" role="group">
						<FormTextInputWithAffixes
							prefix="http://"
							type="text"
							value={ this.state.searchQuery }
							placeholder={ translate( 'example.com' ) }
							onBlur={ this.save }
							onChange={ this.setSearchQuery }
							onClick={ this.recordInputFocus }
							autoFocus
						/>
					</div>
					<button
						disabled={ this.state.searchQuery.length === 0 }
						className="transfer-domain-step__go button is-primary"
						onClick={ this.recordGoButtonClick }
					>
						{ translate( 'Transfer to WordPress.com' ) }
					</button>
					{ this.domainRegistrationUpsell() }
					<div className="transfer-domain-step__map-option">
						<p>
							{ translate(
								"Don't want to transfer? Keep it at your current domain provider " +
									'and {{a}}map it{{/a}} for %(cost)s instead.',
								{
									args: { cost },
									components: { a: <a href="#" onClick={ this.goToMapDomainStep } /> },
								}
							) }
							<Gridicon icon="help" size={ 12 } />
						</p>
					</div>
				</form>
			</div>
		);
	}

	transferDomainPrecheck() {
		return <TransferDomainPrecheck domain={ this.state.domain } setValid={ this.precheckOk } />;
	}

	precheckOk = () => {
		this.setState( { optionPicker: true } );
	};

	transferDomainOptions() {
		return (
			<TransferDomainOptions
				domain={ this.state.domain }
				onSubmit={ this.props.onTransferDomain }
			/>
		);
	}

	render() {
		let content;
		const { domain, optionPicker } = this.state;

		if ( domain && ! optionPicker ) {
			content = this.transferDomainPrecheck();
		} else if ( domain && optionPicker ) {
			content = this.transferDomainOptions();
		} else {
			content = this.addTransfer();
		}

		return <div className="transfer-domain-step">{ content }</div>;
	}

	domainRegistrationUpsell() {
		const { suggestion } = this.state;
		if ( ! suggestion ) {
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
					suggestion={ suggestion }
					selectedSite={ this.props.selectedSite }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					key={ suggestion.domain_name }
					cart={ this.props.cart }
					onButtonClick={ this.registerSuggestedDomain }
				/>
			</div>
		);
	}

	registerSuggestedDomain = () => {
		this.props.recordAddDomainButtonClickInMapDomain(
			this.state.suggestion.domain_name,
			this.props.analyticsSection
		);

		return this.props.onRegisterDomain( this.state.suggestion );
	};

	recordInputFocus = () => {
		this.props.recordInputFocusInMapDomain( this.state.searchQuery );
	};

	recordGoButtonClick = () => {
		this.props.recordGoButtonClickInMapDomain(
			this.state.searchQuery,
			this.props.analyticsSection
		);
	};

	setSearchQuery = event => {
		this.setState( { searchQuery: event.target.value } );
	};

	handleFormSubmit = event => {
		event.preventDefault();

		const domain = getFixedDomainSearch( this.state.searchQuery );
		this.props.recordFormSubmitInMapDomain( this.state.searchQuery );
		this.setState( { suggestion: null, notice: null } );

		checkDomainAvailability( domain, ( error, result ) => {
			const status = get( result, 'status', error );
			switch ( status ) {
				case domainAvailability.MAPPABLE:
				case domainAvailability.UNKNOWN:
					this.setState( { domain } );
					return;

				case domainAvailability.AVAILABLE:
					this.setState( { suggestion: result } );
					return;

				default:
					const { message, severity } = getAvailabilityNotice( domain, status );
					this.setState( { notice: message, noticeSeverity: severity } );
					return;
			}
		} );
	};
}

const recordMapDomainButtonClick = section =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Map it" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_mapping_button_click', { section } )
	);

export default connect(
	state => ( {
		currentUser: getCurrentUser( state ),
		selectedSite: getSelectedSite( state ),
	} ),
	{
		recordAddDomainButtonClickInMapDomain,
		recordFormSubmitInMapDomain,
		recordInputFocusInMapDomain,
		recordGoButtonClickInMapDomain,
		recordMapDomainButtonClick,
	}
)( localize( TransferDomainStep ) );
