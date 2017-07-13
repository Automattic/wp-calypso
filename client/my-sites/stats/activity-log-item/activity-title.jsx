/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

class ActivityTitle extends Component {

	static propTypes = {
		group: PropTypes.oneOf( [
			'attachment',
			'comment',
			'core',
			'plugin',
			'post',
			'term',
			'theme',
			'user',
			'widget',
		] ).isRequired,
		name: PropTypes.string.isRequired,

		object: PropTypes.shape( {
			attachment: PropTypes.shape( {
				mime_type: PropTypes.string,
				id: PropTypes.number.isRequired,
				title: PropTypes.string.isRequired,
				url: PropTypes.shape( {
					host: PropTypes.string.isRequired,
					url: PropTypes.string.isRequired,
					host_reversed: PropTypes.string.isRequired,
				} ).isRequired,
			} ),

			comment: PropTypes.shape( {
				approved: PropTypes.bool.isRequired,
				id: PropTypes.number.isRequired,
			} ),

			core: PropTypes.shape( {
				new_version: PropTypes.string,
				old_version: PropTypes.string,
			} ),

			plugin: PropTypes.oneOfType( [
				PropTypes.shape( {
					name: PropTypes.string,
					previous_version: PropTypes.string,
					slug: PropTypes.string,
					version: PropTypes.string,
				} ),
				PropTypes.arrayOf(
					PropTypes.shape( {
						name: PropTypes.string,
						previous_version: PropTypes.string,
						slug: PropTypes.string,
						version: PropTypes.string,
					} ),
				),
			] ),

			post: PropTypes.shape( {
				id: PropTypes.number.isRequired,
				status: PropTypes.string.isRequired,
				type: PropTypes.string,
				title: PropTypes.string,
			} ),

			term: PropTypes.shape( {
				id: PropTypes.number.isRequired,
				title: PropTypes.string.isRequired,
				type: PropTypes.string.isRequired,
			} ),

			theme: PropTypes.oneOfType( [
				PropTypes.arrayOf(
					PropTypes.shape( {
						name: PropTypes.string,
						slug: PropTypes.string,
						uri: PropTypes.string,
						version: PropTypes.string,
					} )
				),
				PropTypes.shape( {
					name: PropTypes.string,
					slug: PropTypes.string,
					uri: PropTypes.string,
					version: PropTypes.string,
				} ),
			] ),

			user: PropTypes.shape( {
				display_name: PropTypes.string,
				external_user_id: PropTypes.string,
				login: PropTypes.string,
				wpcom_user_id: PropTypes.number,
			} ),

			widget: PropTypes.shape( {
				id: PropTypes.number,
				name: PropTypes.string,
				sidebar: PropTypes.string,
			} ),
		} ).isRequired,

		// localize
		moment: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	renderTitle() {
		const { name } = this.props;

		return name;
	}

	renderSubtitle() {
		return null;
	}

	render() {
		const title = this.renderTitle();
		const subTitle = this.renderSubtitle();

		return (
			<div className="activity-log-item__title">
				<div className="activity-log-item__title-title">{ title }</div>
				{ subTitle && <div className="activity-log-item__title-subtitle">{ subTitle }</div> }
			</div>
		);
	}
}

export default localize( ActivityTitle );
