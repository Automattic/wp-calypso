/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import classnames from 'classnames';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import MaterialIcon from 'components/material-icon';
import { getSelectedSiteId } from 'state/ui/selectors';

export class ChecklistSidebarItem extends Component {
	static propTypes = {
		siteSuffix: PropTypes.string.isRequired,
		taskList: PropTypes.object,
		onSidebarNavigate: PropTypes.func.isRequired,
		sidebarItemSelected: PropTypes.bool,
		hasChecklistLoadedOnce: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const {
			hasChecklistLoadedOnce,
			onSidebarNavigate,
			sidebarItemSelected,
			siteSuffix,
			translate,
			taskList,
		} = this.props;
		const classes = classnames( 'checklist-sidebar-item__wrapper', {
			selected: sidebarItemSelected,
		} );
		const { total, completed } = taskList.getCompletionStatus();
		const isUnfinished = taskList.getFirstIncompleteTask();

		if ( isUnfinished ) {
			return (
				<li className={ classes } data-tip-target="checklist">
					<a onClick={ onSidebarNavigate } href={ `/checklist${ siteSuffix }` }>
						<MaterialIcon icon="check_circle" />
						<span className="checklist-sidebar-item__text">{ translate( 'Checklist' ) }</span>
						{ hasChecklistLoadedOnce && (
							<span className="checklist-sidebar-item__secondary-text sidebar__menu-link-secondary-text">
								{ translate( '%(complete)d/%(total)d', {
									comment: 'Numerical progress indicator, like 5/9',
									args: {
										complete: completed,
										total: total,
									},
								} ) }
							</span>
						) }
					</a>
				</li>
			);
		}

		return null;
	}
}

export default connect( state => ( {
	// To prevent flickering only. Because the sidebar is mainly omnipresent, we don't care about future checklist requests
	// for the selected site
	hasChecklistLoadedOnce: !! get( state, [ 'checklist', getSelectedSiteId( state ) ], false ),
} ) )( localize( ChecklistSidebarItem ) );
