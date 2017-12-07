/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import QuerySiteSettings from 'components/data/query-site-settings';
import { saveSiteSettings } from 'state/site-settings/actions';
import { getSiteSettings, isRequestingSiteSettings } from 'state/site-settings/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class JetpackOnboardingSiteTitleStep extends React.PureComponent {
	state = {
		description: '',
		title: '',
	};

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isRequesting && ! nextProps.isRequesting ) {
			this.setState( {
				title: nextProps.siteSettings.blogname,
				description: nextProps.siteSettings.blogdescription,
			} );
		}
	}

	setDescription = event => {
		this.setState( { description: event.target.value } );
	};

	setTitle = event => {
		this.setState( { title: event.target.value } );
	};

	submit = () => {
		this.props.saveSiteSettings( this.props.siteId, {
			blogname: this.state.title,
			blogdescription: this.state.description,
		} );
	};

	render() {
		const { isRequesting, siteId, translate } = this.props;
		const headerText = translate( "Let's get started." );
		const subHeaderText = translate(
			'First up, what would you like to name your site and have as its public description?'
		);

		return (
			<Fragment>
				<QuerySiteSettings siteId={ siteId } />
				<DocumentHead title={ translate( 'Site Title ‹ Jetpack Onboarding' ) } />
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<Card className="steps__form">
					<form>
						<FormFieldset>
							<FormLabel htmlFor="title">{ translate( 'Site Title' ) }</FormLabel>
							<FormTextInput
								autoFocus
								disabled={ isRequesting }
								id="title"
								onChange={ this.setTitle }
								value={ this.state.title }
							/>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="description">{ translate( 'Site Description' ) }</FormLabel>
							<FormTextarea
								disabled={ isRequesting }
								id="description"
								onChange={ this.setDescription }
								value={ this.state.description }
							/>
						</FormFieldset>

						<Button href={ this.props.getForwardUrl() } onClick={ this.submit } primary>
							{ translate( 'Next Step' ) }
						</Button>
					</form>
				</Card>
			</Fragment>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			isRequesting: isRequestingSiteSettings( state, siteId ),
			siteId,
			siteSettings: getSiteSettings( state, siteId ),
		};
	},
	{ saveSiteSettings }
)( localize( JetpackOnboardingSiteTitleStep ) );
