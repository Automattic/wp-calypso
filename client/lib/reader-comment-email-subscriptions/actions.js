//var debug = require( 'debug' )( 'calypso:email-subscription-actions' );

// Internal dependencies
var Dispatcher = require('dispatcher'),
    wpcom = require('lib/wp'),
    ActionTypes = require('./constants').action,
    warn = require('lib/warn');

var CommentEmailSubscriptionActions = {
    subscribe: function(blogId) {
        if (!blogId) {
            warn('Blog ID not provided to CommentEmailSubscriptionActions.subscribe');
            return;
        }

        Dispatcher.handleViewAction({
            type: ActionTypes.SUBSCRIBE_TO_COMMENT_EMAILS,
            blog_id: blogId,
        });

        wpcom.undocumented().readNewCommentEmailSubscription({
            site: blogId,
        }, function(error, data) {
            Dispatcher.handleServerAction({
                type: ActionTypes.RECEIVE_SUBSCRIBE_TO_COMMENT_EMAILS,
                blog_id: blogId,
                data: data,
                error: error,
            });
        });
    },

    unsubscribe: function(blogId) {
        if (!blogId) {
            warn('Blog ID not provided to CommentEmailSubscriptionActions.unsubscribe');
            return;
        }

        Dispatcher.handleViewAction({
            type: ActionTypes.UNSUBSCRIBE_FROM_COMMENT_EMAILS,
            blog_id: blogId,
        });

        wpcom.undocumented().readDeleteCommentEmailSubscription({
            site: blogId,
        }, function(error, data) {
            Dispatcher.handleServerAction({
                type: ActionTypes.RECEIVE_UNSUBSCRIBE_FROM_COMMENT_EMAILS,
                blog_id: blogId,
                data: data,
                error: error,
            });
        });
    },

    dismissError: function(error) {
        if (!error) {
            return;
        }

        Dispatcher.handleViewAction({
            type: ActionTypes.DISMISS_FOLLOW_ERROR,
            data: error,
        });
    },
};

module.exports = CommentEmailSubscriptionActions;
