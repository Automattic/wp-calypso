import { Card } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SettingsForm from 'calypso/me/notification-settings/settings-form';
import { getSite } from 'calypso/state/sites/selectors';
import Header from './header';

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

	// Does the URL contain the anchor #site-domain ?
	checkForSiteAnchor = () => {
		const domain = this.props.site?.domain ?? '';
		if ( domain.length === 0 ) {
			return false;
		}
		const hash = window.location.hash.substr( 1 );
		if ( hash.indexOf( domain ) > -1 ) {
			return true;
		}
		return false;
	};

	state = { isExpanded: this.checkForSiteAnchor() };

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

		const styles = clsx( 'notification-settings-blog-settings', {
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
			'blogging_prompt',
			'draft_post_prompt',
		];

		if ( site.options?.woocommerce_is_active ) {
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
