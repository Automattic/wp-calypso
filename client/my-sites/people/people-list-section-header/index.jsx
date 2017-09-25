/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import Tooltip from 'components/tooltip';
import { getSelectedSiteId } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

class PeopleListSectionHeader extends Component {
	static propTypes = {
		label: PropTypes.string.isRequired,
		count: PropTypes.number,
		isFollower: PropTypes.bool,
		site: PropTypes.object,
		isSiteAutomatedTransfer: PropTypes.bool,
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

	getAddLink() {
		const siteSlug = get( this.props, 'site.slug' );
		const isJetpack = get( this.props, 'site.jetpack' );

		if ( ! siteSlug || ( isJetpack && this.props.isFollower ) ) {
			return false;
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

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	return {
		isSiteAutomatedTransfer: !! isSiteAutomatedTransfer( state, selectedSiteId ),
	};
};

export default connect( mapStateToProps )( localize( PeopleListSectionHeader ) );
