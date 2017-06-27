/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Site from 'blocks/site';
import { recordCheckboxEvent } from 'me/event-recorder';

class ProfileLinksAddWordPressSite extends Component {
	static propTypes = {
		onChange: PropTypes.func.isRequired,
		onSelect: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
		checked: PropTypes.bool,
	};

	static defaultProps = {
		checked: false,
	};

	inputName = `site-${ this.props.site.ID }`;

	onSelect = this.props.onSelect.bind( null, this.inputName );

	render() {
		const { checked, onChange, site } = this.props;

		return (
			<li
				key={ site.ID }
				className="profile-links-add-wordpress__item"
				onClick={ recordCheckboxEvent( 'Add WordPress Site' ) }
			>
				<input
					className="profile-links-add-wordpress__checkbox"
					type="checkbox"
					name={ this.inputName }
					onChange={ onChange }
					checked={ checked } />
				<Site
					site={ site }
					indicator={ false }
					onSelect={ this.onSelect } />
			</li>
		);
	}
}

export default ProfileLinksAddWordPressSite;
