/**
 * External dependencies
 */
import { noop, omit } from 'lodash';

/**
 * Internal dependencies
 */
import Notice from './';

/**
* Renders a list of notices.
*
* @param  {Object}   $0           Props passed to the component.
* @param  {Array}    $0.notices   Array of notices to render.
* @param  {Function} $0.onRemove  Function called when a notice should be removed / dismissed.
* @param  {Object}   $0.className Name of the class used by the component.
* @param  {Object}   $0.children  Array of children to be rendered inside the notice list.
* @return {Object}                The rendered notices list.
*/
function NoticeList( { notices, onRemove = noop, className = 'components-notice-list', children } ) {
	const removeNotice = ( id ) => () => onRemove( id );

	return (
		<div className={ className }>
			{ children }
			{ [ ...notices ].reverse().map( ( notice ) => (
				<Notice { ...omit( notice, 'content' ) } key={ notice.id } onRemove={ removeNotice( notice.id ) }>
					{ notice.content }
				</Notice>
			) ) }
		</div>
	);
}

export default NoticeList;
