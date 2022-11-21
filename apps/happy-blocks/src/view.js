import './view.scss';
import { updateForumTopicDate } from './support-content/view';

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( '.wp-block-happy-blocks-forum-topic' ).forEach( updateForumTopicDate );
} );
