import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
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
import './style.scss';

class DomainRedirectCard extends Component {
	static propTypes = {
		redirect: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired,
		domainName: PropTypes.string.isRequired,
		targetUrl: PropTypes.string.isRequired,
	};

	state = {
		targetUrl: this.props.targetUrl,
		protocol: this.props.redirect.secure ? 'https' : 'http',
	};

	componentDidMount() {
		this.props.fetchDomainRedirect( this.props.domainName );
	}

	componentWillUnmount() {
		this.props.closeDomainRedirectNotice( this.props.domainName );
	}

	handleChange = ( event ) => {
		const targetHost = withoutHttp( event.target.value );
		this.setState( { targetHost } );
	};

	handleClick = () => {
		if ( this.props.selectedSite ) {
			this.props
				.updateDomainRedirect(
					this.props.domainName,
					this.state.targetUrl, //tofix
					null,
					null,
					this.state.secure
				)
				.then( ( success ) => {
					if ( success ) {
						this.props.fetchDomainRedirect( this.props.domainName );

						this.props.successNotice(
							this.props.translate( 'Site redirect updated successfully.' ),
							{
								duration: 5000,
								id: `site-redirect-update-notification`,
							}
						);
					} else {
						this.props.errorNotice( this.props.redirect.notice.text );
					}
				} );
		}
	};

	handleChangeSecure = ( event ) => {
		this.setState( { protocol: event.target.value } );
	};

	render() {
		const { redirect, translate } = this.props;
		const { isUpdating, isFetching } = redirect;
		const prefix = (
			<>
				<FormSelect
					name="protocol"
					id="protocol-type"
					value={ this.state.protocol }
					onChange={ this.handleChangeSecure }
				>
					<option value="https">{ translate( 'https://' ) }</option>
					<option value="http">{ translate( 'http://' ) }</option>
				</FormSelect>
			</>
		);
		return (
			<form>
				<FormFieldset className="domain-redirect-card__fields">
					<FormTextInputWithAffixes
						disabled={ isFetching || isUpdating }
						name="destination"
						noWrap
						onChange={ this.handleChange }
						prefix={ prefix }
						value={ this.state.targetHost || '' }
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
						isFetching ||
						isUpdating ||
						( this.props.redirect?.targetHost === this.state.targetHost &&
							( this.props.redirect.secure ? 'https' : 'http' ) === this.state.protcol )
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
	( state, ownProps ) => {
		const redirect = getDomainRedirect( state, ownProps.domainName );
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

		return { redirect, targetUrl };
	},
	{
		fetchDomainRedirect,
		updateDomainRedirect,
		closeDomainRedirectNotice,
		successNotice,
		errorNotice,
	}
)( localize( DomainRedirectCard ) );
