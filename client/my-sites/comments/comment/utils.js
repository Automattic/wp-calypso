/** @format */
/**
 * External dependencies
 */
import { get, includes } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';

/**
 * Return the comment author display name, or "Anonymous" if the comment author has no name.
 *
 * @param {Object} comment A comment object.
 * @returns {String} The comment author display name.
 */
export const getAuthorDisplayName = comment =>
	decodeEntities( get( comment, 'author.name', translate( 'Anonymous' ) ) );

/**
 * Create a stripped down comment object containing only the information needed by
 * CommentList's change status and reply functions, and their respective undos.
 *
 * @param {Object} comment A comment object.
 * @returns {Object} A stripped down comment object.
 */
export const getMinimalComment = comment => ( {
	commentId: get( comment, 'ID' ),
	isLiked: get( comment, 'i_like' ),
	postId: get( comment, 'post.ID' ),
	status: get( comment, 'status' ),
} );

/**
 * Return the comment parent post title, or "Untitled" if the parent post has no title.
 *
 * @param {Object} comment A comment object.
 * @returns {String} The comment parent post title.
 */
export const getPostTitle = comment =>
	decodeEntities( get( comment, 'post.title', translate( 'Untitled' ) ) );

/**
 * Check if a site blacklist contains an email address.
 *
 * @param {String} blacklist A site blacklist.
 * @param {String} email An email address.
 * @returns {Boolean} If the blacklist contains the email address.
 */
export const isEmailBlacklisted = ( blacklist, email ) =>
	!! email && !! blacklist ? includes( blacklist.split( '\n' ), email ) : false;
