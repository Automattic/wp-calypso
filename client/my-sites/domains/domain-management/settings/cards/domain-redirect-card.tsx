import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { withoutHttp } from 'calypso/lib/url';
import { DOMAIN_REDIRECT } from 'calypso/lib/url/support';
import {
	closeDomainRedirectNotice,
	fetchDomainRedirect,
	updateDomainRedirect,
} from 'calypso/state/domains/domain-redirects/actions';
import { getDomainRedirect } from 'calypso/state/domains/domain-redirects/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: `site-redirect-update-notification`,
};

class DomainRedirectCard extends Component {
	static propTypes = {
		redirect: PropTypes.object.isRequired,
		domainName: PropTypes.string.isRequired,
		targetUrl: PropTypes.string.isRequired,
		currentRoute: PropTypes.string.isRequired,
	};

	state = {
		redirectUrl: this.props.targetUrl ?? '',
	};

	componentDidMount() {
		this.props.fetchDomainRedirect( this.props.domainName );
	}

	componentWillUnmount() {
		this.props.closeDomainRedirectNotice( this.props.domainName );
	}

	handleChange = ( event ) => {
		const redirectUrl = withoutHttp( event.target.value );

		this.setState( { redirectUrl } );
	};

	handleClick = () => {
		if ( this.props.selectedSite ) {
			this.props
				.updateDomainRedirect( this.props.selectedSite.domain, this.state.redirectUrl )
				.then( ( success ) => {
					if ( success ) {
						this.props.fetchDomainRedirect( this.state.redirectUrl.replace( /\/+$/, '' ).trim() );

						this.props.successNotice(
							this.props.translate( 'Site redirect updated successfully.' ),
							noticeOptions
						);
					} else {
						this.props.errorNotice( this.props.redirect.notice.text );
					}
				} );
		}
	};

	render() {
		const { redirect, translate } = this.props;
		const { isUpdating, isFetching } = redirect;

		return (
			<form>
				<FormFieldset>
					<FormTextInputWithAffixes
						disabled={ isFetching || isUpdating }
						name="destination"
						noWrap
						onChange={ this.handleChange }
						prefix="http://"
						value={ this.state.redirectUrl }
						id="domain-redirect__input"
					/>

					<p className="domain-redirect-card__explanation">
						{ translate(
							'Requests to your domain will receive an HTTP redirect here. ' +
								'{{learnMoreLink}}Learn more{{/learnMoreLink}}',
							{
								components: {
									learnMoreLink: (
										<a
											href={ localizeUrl( DOMAIN_REDIRECT ) }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</p>
				</FormFieldset>

				<FormButton
					disabled={
						isFetching || isUpdating || this.props.redirect.value === this.state.redirectUrl
					}
					onClick={ this.handleClick }
				>
					{ translate( 'Update' ) }
				</FormButton>
			</form>
		);
	}
}

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		const currentRoute = getCurrentRoute( state );
		const redirect = getDomainRedirect( state, selectedSite?.domain );
		let targetUrl = '';
		try {
			const url = new URL(
				redirect?.targetPath ?? '/',
				redirect?.targetHost ?? 'https://_invalid_.domain'
			);
			if ( url.origin !== 'https://_invalid_.domain' ) {
				targetUrl = url.hostname + url.pathname + url.search + url.hash;
			}
		} catch ( e ) {
			console.log( e ); // todo: replace with `// ignore`, wip: still working out what we get from backend and how much we need to guard this code
		}

		return { selectedSite, redirect, currentRoute, targetUrl };
	},
	{
		fetchDomainRedirect,
		fetchSiteDomains,
		updateDomainRedirect,
		closeDomainRedirectNotice,
		successNotice,
		errorNotice,
	}
)( localize( DomainRedirectCard ) );
