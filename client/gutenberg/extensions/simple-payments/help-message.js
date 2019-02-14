/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import GridiconNoticeOutline from 'gridicons/dist/notice-outline';
import './help-message.scss';

export default ( { children = null, isError = false, ...props } ) => {
	const classes = classNames( 'simple-payments__help-message', {
		'simple-payments__help-message-is-error': isError,
	} );

	return (
		children && (
			<div className={ classes } { ...props }>
				{ isError && <GridiconNoticeOutline size="24" /> }
				<span>{ children }</span>
			</div>
		)
	);
};
