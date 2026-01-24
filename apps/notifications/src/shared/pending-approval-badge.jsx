/* eslint-disable wpcalypso/jsx-classname-namespace */

import PropTypes from 'prop-types';
import { getCommentsUrl, getReferenceId } from '../panel/helpers/notes';

/**
 * PendingApprovalBadge component that works with both modern and legacy systems
 */
const PendingApprovalBadge = ( { note, translate, icon, isModern = false } ) => {
	const commentsUrl = getCommentsUrl( getReferenceId( note, 'site' ) );
	const pendingText = translate( 'Pending Approval' );
	const manageText = translate( 'Manage Comments' );

	// Modern version uses inline styles
	if ( isModern ) {
		const styles = {
			container: {
				display: 'flex',
				alignItems: 'center',
				gap: '8px',
				padding: '12px 16px',
				margin: '-16px -16px 0',
				backgroundColor: 'color-mix(in srgb, var(--color-warning, #f0b849) 10%, transparent)',
				borderInlineStart: '3px solid var(--color-warning, #f0b849)',
				fontSize: '13px',
			},
			text: { fontWeight: 500, color: 'var(--color-warning-80, #614200)' },
			link: { marginInlineStart: 'auto', fontWeight: 500, whiteSpace: 'nowrap' },
		};

		return (
			<div className="wpnc__pending-approval-badge" style={ styles.container }>
				{ icon }
				<span style={ styles.text }>{ pendingText }</span>
				{ commentsUrl && (
					<a href={ commentsUrl } target="_blank" rel="noopener noreferrer" style={ styles.link }>
						{ manageText }
					</a>
				) }
			</div>
		);
	}

	// Legacy version relies on CSS classes
	return (
		<div className="wpnc__pending-approval-badge">
			{ icon }
			<span className="wpnc__pending-approval-badge__text">{ pendingText }</span>
			{ commentsUrl && (
				<a
					className="wpnc__pending-approval-badge__link"
					href={ commentsUrl }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ manageText }
				</a>
			) }
		</div>
	);
};

PendingApprovalBadge.propTypes = {
	note: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
	icon: PropTypes.node.isRequired,
	isModern: PropTypes.bool,
};

export default PendingApprovalBadge;
