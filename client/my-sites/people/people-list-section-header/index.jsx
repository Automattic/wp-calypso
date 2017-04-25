/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import get from 'lodash/get';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import Tooltip from 'components/tooltip';
import config from 'config';

class PeopleListSectionHeader extends Component {
	static propTypes = {
		label: PropTypes.string.isRequired,
		count: PropTypes.number,
		isFollower: PropTypes.bool,
		site: PropTypes.object
	};

	static defaultProps = {
		isFollower: false
	};

	constructor( props ) {
		super( props );
		this.state = {
			addPeopleTooltip: false
		};
	}

	showAddTooltip = () => this.setState( { addPeopleTooltip: true } );

	hideAddTooltip = () => this.setState( { addPeopleTooltip: false } );

	shouldUseWPAdmin() {
		return ! config.isEnabled( 'jetpack/invites' ) && get( this.props, 'site.jetpack' );
	}

	getAddLink() {
		const siteSlug = get( this.props, 'site.slug' );
		const isJetpack = get( this.props, 'site.jetpack' );
		const wpAdminUrl = get( this.props, 'site.options.admin_url' );

		if ( ! siteSlug || ( isJetpack && this.props.isFollower ) ) {
			return false;
		}

		if ( this.shouldUseWPAdmin() ) {
			return wpAdminUrl + 'user-new.php';
		}

		return '/people/new/' + siteSlug;
	}

	render() {
		const { label, count, children, translate } = this.props;
		const siteLink = this.getAddLink();
		const classes = classNames(
			this.props.className,
			'people-list-section-header'
		);

		return (
			<SectionHeader
				className={ classes }
				count={ count }
				label={ label } >
				{ children }
				{ siteLink &&
					<ButtonGroup>
						<Button
							compact
							href={ siteLink }
							target={ this.shouldUseWPAdmin() ? '_new' : null }
							className="people-list-section-header__add-button"
							onMouseEnter={ this.showAddTooltip }
							onMouseLeave={ this.hideAddTooltip }
							ref="addPeopleButton"
							aria-label={ translate( 'Invite user', { context: 'button label' } ) }>
							<Gridicon icon="plus-small" size={ 18 } /><Gridicon icon="user" size={ 18 } />
							<Tooltip
								isVisible={ this.state.addPeopleTooltip }
								context={ this.refs && this.refs.addPeopleButton }
								position="bottom">
								{ translate( 'Invite user', { context: 'button tooltip' } ) }
							</Tooltip>
						</Button>
					</ButtonGroup>

				}
			</SectionHeader>
		);
	}
}

export default localize( PeopleListSectionHeader );
