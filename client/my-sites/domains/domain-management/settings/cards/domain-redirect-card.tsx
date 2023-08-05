import { localizeUrl } from '@automattic/i18n-utils';
import { createHigherOrderComponent } from '@wordpress/compose';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect, useSelector } from 'react-redux';
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
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: `site-redirect-update-notification`,
};

class DomainRedirectCard extends Component {
	static propTypes = {
		redirect: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired,
	};

	state = {
		targetHost: this.props.redirect.targetHost,
		secure: this.props.redirect.secure ? 1 : 0,
	};

	componentDidMount() {
		this.props.fetchDomainRedirect( this.props.selectedSite.domain );
	}

	componentWillUnmount() {
		this.props.closeDomainRedirectNotice( this.props.selectedSite.domain );
	}

	handleChange = ( event ) => {
		const targetHost = withoutHttp( event.target.value );
		this.setState( { targetHost } );
	};

	handleClick = () => {
		if ( this.props.selectedSite ) {
			this.props
				.updateDomainRedirect(
					this.props.selectedSite.domain,
					this.state.targetHost,
					null,
					null,
					this.state.secure
				)
				.then( ( success ) => {
					if ( success ) {
						this.props.fetchDomainRedirect( this.props.selectedSite.domain );

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

	handleChangeSecure = ( event ) => {
		const isSecure = event.target.value;
		this.setState( { secure: isSecure } );
	};

	render() {
		const { redirect, translate } = this.props;
		const { isUpdating, isFetching } = redirect;
		const prefix = (
			<>
				<FormSelect
					name="protocol"
					id="protocol-type"
					value={ this.state.secure }
					onChange={ this.handleChangeSecure }
				>
					<option value="0">{ translate( 'http://' ) }</option>
					<option value="1">{ translate( 'https://' ) }</option>
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
							( this.props.redirect.secure ? 1 : 0 ) === this.state.secure )
					}
					onClick={ this.handleClick }
				>
					{ translate( 'Update' ) }
				</FormButton>
			</form>
		);
	}
}

const withRedirectAsKey = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const selectedSite = useSelector( getSelectedSite );
		const redirect = useSelector( ( state ) => getDomainRedirect( state, selectedSite?.domain ) );

		return <Wrapped { ...props } key={ `redirect-${ redirect.targetHost }` } />;
	},
	'withRedirectAsKey'
);

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		const redirect = getDomainRedirect( state, selectedSite?.domain );
		return { selectedSite, redirect };
	},
	{
		fetchDomainRedirect,
		updateDomainRedirect,
		closeDomainRedirectNotice,
		successNotice,
		errorNotice,
	}
)( localize( withRedirectAsKey( DomainRedirectCard ) ) );
