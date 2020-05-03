/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';
import importerConfig from 'lib/importer/importer-config';
import { Button, Card } from '@automattic/components';
import ImporterLogo from 'my-sites/importer/importer-logo';
import StepWrapper from '../../step-wrapper';

/**
 * Style dependencies
 */
import './style.scss';

class ImportPreview extends Component {
	constructor( props ) {
		super( props );

		const { translate } = this.props;
		this.previewData = {
			wordpress: {
				supported: [
					translate( 'Posts' ),
					translate( 'Pages' ),
					translate( 'Images' ),
					translate( 'Other media' ),
					translate( 'Comments' ),
				],
				unsupported: translate( "We're unable to import your theme, plugins or online store." ),
			},
			blogger: {
				supported: [
					translate( 'Posts' ),
					translate( 'Pages' ),
					translate( 'Images' ),
					translate( 'Comments' ),
					translate( 'Tags' ),
				],
				unsupported: translate(
					"We're unable to import your theme, plugins, comments, or online store."
				),
			},
			'godaddy-gocentral': {
				supported: [
					translate( 'Pages' ),
					translate( 'Blog posts' ),
					translate( 'Images' ),
					translate( 'Other media' ),
				],
				unsupported: translate(
					"We're unable to import your online store, site layout, or styling."
				),
			},
			medium: {
				supported: [
					translate( 'Posts' ),
					translate( 'Images' ),
					translate( 'Other media' ),
					translate( 'Tags' ),
				],
				unsupported: translate( "We're unable to import your drafts, comments or followers." ),
			},
			squarespace: {
				supported: [
					translate( 'Posts' ),
					translate( 'Pages' ),
					translate( 'Images' ),
					translate( 'Comments' ),
					translate( 'Tags' ),
				],
				unsupported: translate(
					"We're unable to import your online store, template, layout or styling."
				),
			},
			wix: {
				supported: [
					translate( 'Pages' ),
					translate( 'Blog posts' ),
					translate( 'Images' ),
					translate( 'Other media' ),
				],
				unsupported: translate(
					"We're unable to import your online store, site layout, or styling."
				),
			},
		};
	}

	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	submitImportPreview() {
		this.props.submitSignupStep( { stepName: this.props.stepName } );
		this.props.goToNextStep();
	}

	renderIcon() {
		const {
			signupDependencies: { importSiteEngine },
		} = this.props;

		const importerData = importerConfig()[ importSiteEngine ];

		return (
			<ImporterLogo
				icon={ importerData.icon }
				className={ 'import-preview__icon importer__service-icon ' + importSiteEngine }
			/>
		);
	}

	renderSupported() {
		const {
			signupDependencies: { importSiteEngine },
		} = this.props;

		// The preceding steps always provide a value for importSiteEngine
		const items = this.previewData[ importSiteEngine ].supported || [];

		const listItems = items.map( ( item ) => {
			return (
				<li className="import-preview__supported-item" key={ item }>
					<Gridicon icon="checkmark" size={ 18 } className="import-preview__checkmark" />
					<div className="import-preview__supported-text">{ item }</div>
				</li>
			);
		} );

		return <ul className="import-preview__supported">{ listItems }</ul>;
	}

	renderPreview() {
		const {
			signupDependencies: { importSiteEngine, importSiteUrl, siteTitle },
			translate,
		} = this.props;

		let cardTitle = siteTitle;
		let trimmedSiteUrl = '';

		if ( isEmpty( importSiteUrl ) ) {
			// The user has an import file and told us the source
			const importerData = importerConfig()[ importSiteEngine ];
			cardTitle = translate( 'Importing from %(importerName)s', {
				args: { importerName: importerData.title },
			} );
		} else {
			trimmedSiteUrl = importSiteUrl.replace( /^(?:https?:\/\/)?(.*?)(?:\/)?$/, '$1' );
			if ( isEmpty( cardTitle ) ) {
				cardTitle = trimmedSiteUrl;
				trimmedSiteUrl = '';
			}
		}

		return (
			<Card className="import-preview__card">
				<header className="import-preview__header">
					{ this.renderIcon() }
					<div className="import-preview__header-text">
						<h2 className="import-preview__title">{ cardTitle }</h2>
						<div className="import-preview__url">{ trimmedSiteUrl }</div>
					</div>
				</header>
				{ this.renderSupported() }
				<p className="import-preview__unsupported">
					{ this.previewData[ importSiteEngine ].unsupported }
				</p>
				<Button primary onClick={ this.submitImportPreview.bind( this ) }>
					{ translate( 'Continue' ) }
				</Button>
			</Card>
		);
	}

	render() {
		const { flowName, positionInFlow, stepName, translate } = this.props;

		const headerText = translate( "Here's what we'll import to your new site." );
		const stepContent = this.renderPreview();

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				stepContent={ stepContent }
			/>
		);
	}
}

export default connect( null, {
	saveSignupStep,
	submitSignupStep,
} )( localize( ImportPreview ) );
