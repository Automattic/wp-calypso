//var debug = require( 'debug' )( 'calypso:email-subscription-actions' );

// Internal dependencies
var Dispatcher = require('dispatcher'),
    wpcom = require('lib/wp'),
    ActionTypes = require('./constants').action,
    warn = require('lib/warn');

var PostEmailSubscriptionActions = {
    subscribe: function(blogId, deliveryFrequency) {
        if (!blogId) {
            warn('Blog ID not provided to PostEmailSubscriptionActions.subscribe');
            return;
        }

        Dispatcher.handleViewAction({
            type: ActionTypes.SUBSCRIBE_TO_POST_EMAILS,
            blog_id: blogId,
            delivery_frequency: deliveryFrequency,
        });

        wpcom.undocumented().readNewPostEmailSubscription({
            site: blogId,
            delivery_frequency: deliveryFrequency,
        }, function(error, data) {
            Dispatcher.handleServerAction({
                type: ActionTypes.RECEIVE_SUBSCRIBE_TO_POST_EMAILS,
                blog_id: blogId,
                data: data,
                error: error,
            });
        });
    },

    updateDeliveryFrequency: function(blogId, deliveryFrequency) {
        if (!blogId) {
            warn('Blog ID not provided to PostEmailSubscriptionActions.updateDeliveryFrequency');
            return;
        }

        Dispatcher.handleViewAction({
            type: ActionTypes.UPDATE_POST_EMAIL_DELIVERY_FREQUENCY,
            blog_id: blogId,
            delivery_frequency: deliveryFrequency,
        });

        wpcom.undocumented().readUpdatePostEmailSubscription({
            site: blogId,
            delivery_frequency: deliveryFrequency,
        }, function(error, data) {
            Dispatcher.handleServerAction({
                type: ActionTypes.RECEIVE_UPDATE_POST_EMAIL_DELIVERY_FREQUENCY,
                blog_id: blogId,
                data: data,
                error: error,
            });
        });
    },

    unsubscribe: function(blogId) {
        if (!blogId) {
            warn('Blog ID not provided to PostEmailSubscriptionActions.unsubscribe');
            return;
        }

        Dispatcher.handleViewAction({
            type: ActionTypes.UNSUBSCRIBE_FROM_POST_EMAILS,
            blog_id: blogId,
        });

        wpcom.undocumented().readDeletePostEmailSubscription({
            site: blogId,
        }, function(error, data) {
            Dispatcher.handleServerAction({
                type: ActionTypes.RECEIVE_UNSUBSCRIBE_FROM_POST_EMAILS,
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

module.exports = PostEmailSubscriptionActions;
