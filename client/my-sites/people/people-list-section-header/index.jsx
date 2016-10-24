/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import Gridicon from 'components/gridicon';
import Tooltip from 'components/tooltip';
import config from 'config';

export default React.createClass( {
	displayName: 'PeopleListSectionHeader',

	PropTypes: {
		label: React.PropTypes.string.isRequired,
		count: React.PropTypes.number,
		isFollower: React.PropTypes.bool,
		site: React.PropTypes.object
	},

	getInitialState() {
		return {
			addPeopleTooltip: false
		}
	},

	getDefaultProps() {
		return {
			isFollower: false
		};
	},

	showAddTooltip() {
		this.setState( { addPeopleTooltip: true } );
	},

	hideAddTooltip() {
		this.setState( { addPeopleTooltip: false } );
	},

	getAddLink() {
		const siteSlug = get( this.props, 'site.slug' );
		const isJetpack = get( this.props, 'site.jetpack' );
		const wpAdminUrl = get( this.props, 'site.options.admin_url' );

		if ( ! siteSlug || ( isJetpack && this.props.isFollower ) ) {
			return false;
		}

		if ( isJetpack ) {
			return wpAdminUrl + 'user-new.php';
		}

		return config.isEnabled( 'manage/add-people' )
			? '/people/new/' + siteSlug
			: wpAdminUrl + 'users.php?page=wpcom-invite-users';
	},

	render() {
		const { label, count, site } = this.props;
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

				{ siteLink &&
					<ButtonGroup>
						<Button
							compact
							href={ siteLink }
							target={ site && site.jetpack ? '_new' : null }
							className="people-list-section-header__add-button"
							onMouseEnter={ this.showAddTooltip }
							onMouseLeave={ this.hideAddTooltip }
							ref="addPeopleButton"
							aria-label={ this.translate( 'Invite user', { context: 'button label' } ) }>
							<Gridicon icon="plus-small" size={ 18 } /><Gridicon icon="user" size={ 18 } />
							<Tooltip
								isVisible={ this.state.addPeopleTooltip }
								context={ this.refs && this.refs.addPeopleButton }
								position="bottom">
								{ this.translate( 'Invite user', { context: 'button tooltip' } ) }
							</Tooltip>
						</Button>
					</ButtonGroup>

				}
			</SectionHeader>
		);
	}
} );
