/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { areSettingsGeneralLoaded } from 'woocommerce/state/sites/settings/general/selectors';
import Card from 'components/card';
import CompactTinyMCE from 'woocommerce/components/compact-tinymce';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import SettingsDisplayNoticePreview from './display-notice-preview';

class SettingsDisplayNotice extends Component {
	constructor( props ) {
		super( props );

		// TODO - hook up to woocommerce_demo_store (boolean) and woocommerce_demo_store_notice (string) from redux
		this.state = {
			storeNoticeEnabled: true,
			storeNotice: 'Buy a <a href="#">whoosit</a> today &ndash; you are going to love it.',
		};
	}

	static propTypes = {
		settingsGeneralLoaded: PropTypes.bool,
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func,
	};

	onContentsChange = storeNotice => {
		this.setState( { storeNotice } );
	};

	renderPlaceholder = () => {
		return (
			<div>
				<div className="display__notice-enabled-container placeholder" />
				<div className="display__notice-wysiwyg">
					<div className="display__notice-editor-container placeholder" />
					<div className="display__notice-preview-container placeholder" />
				</div>
			</div>
		);
	};

	possiblyRenderWYSIWYG = () => {
		const { translate } = this.props;
		const { storeNoticeEnabled, storeNotice } = this.state;

		if ( ! storeNoticeEnabled ) {
			return null;
		}

		return (
			<div className="display__notice-wysiwyg">
				<div className="display__notice-editor-container">
					<h4>{ translate( 'Store notice content' ) }</h4>
					<CompactTinyMCE initialValue={ storeNotice } onContentsChange={ this.onContentsChange } />
				</div>
				<div className="display__notice-preview-container">
					<SettingsDisplayNoticePreview value={ storeNotice } />
				</div>
			</div>
		);
	};

	renderForm = () => {
		const { translate } = this.props;
		const { storeNoticeEnabled } = this.state;

		return (
			<div>
				<FormFieldset className="display__notice-enabled-container">
					<FormLabel>
						<FormCheckbox
							checked={ storeNoticeEnabled }
							name="storeNoticeEnabled"
							onChange={ noop }
						/>
						<span>{ translate( 'Display the store notice' ) }</span>
					</FormLabel>
				</FormFieldset>
				{ this.possiblyRenderWYSIWYG() }
			</div>
		);
	};

	render = () => {
		const { settingsGeneralLoaded, siteId, translate } = this.props;
		return (
			<div className="display__notice">
				<ExtendedHeader
					label={ translate( 'Store Notice' ) }
					description={ translate(
						'Display a site-wide notice to inform / engage with customers or highlight promotions.'
					) }
				/>
				<Card className="display__notice-card">
					{ settingsGeneralLoaded ? this.renderForm() : this.renderPlaceholder() }
				</Card>
				<QuerySettingsGeneral siteId={ siteId } />
			</div>
		);
	};
}

function mapStateToProps( state, ownProps ) {
	const { siteId } = ownProps;

	const settingsGeneralLoaded = areSettingsGeneralLoaded( state, siteId );

	return {
		settingsGeneralLoaded,
	};
}

export default localize( connect( mapStateToProps )( SettingsDisplayNotice ) );
