/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';
import Card from 'components/card';
import Header from './header';
import SettingsForm from 'me/notification-settings/settings-form';

class BlogSettings extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
		devices: PropTypes.object,
		disableToggle: PropTypes.bool,
		settings: PropTypes.object.isRequired,
		hasUnsavedChanges: PropTypes.bool.isRequired,
		onToggle: PropTypes.func.isRequired,
		onSave: PropTypes.func.isRequired,
		onSaveToAll: PropTypes.func.isRequired,
	};

	state = { isExpanded: false };

	onToggle = () => {
		const isExpanded = ! this.state.isExpanded;
		this.setState( { isExpanded } );
	};

	render() {
		const {
			site,
			site: { ID: sourceId },
			settings,
			disableToggle,
			hasUnsavedChanges,
			onToggle,
			onSave,
			onSaveToAll,
		} = this.props;

		const { isExpanded } = this.state;

		const styles = classNames( 'notification-settings-blog-settings', {
			'is-compact': ! isExpanded,
			'is-expanded': isExpanded,
		} );

		const settingKeys = [
			'new_comment',
			'comment_like',
			'post_like',
			'follow',
			'achievement',
			'mentions',
			'scheduled_publicize',
		];

		if ( site.options.woocommerce_is_active ) {
			settingKeys.push( 'store_order' );
		}

		return (
			<Card className={ styles }>
				<Header { ...{ site, settings, disableToggle } } onToggle={ this.onToggle } />
				{ ( () => {
					if ( isExpanded || disableToggle ) {
						return (
							<SettingsForm
								{ ...{
									sourceId,
									settings,
									hasUnsavedChanges,
									isApplyAllVisible: ! disableToggle,
									onToggle,
									onSave,
									onSaveToAll,
								} }
								settingKeys={ settingKeys }
							/>
						);
					}
				} )() }
			</Card>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	site: getSite( state, siteId ),
} );

export default connect( mapStateToProps )( BlogSettings );
