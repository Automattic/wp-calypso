/**
 * External dependencies
 */
var React = require('react');

/**
 * Internal dependencies
 */
var actions = require('lib/posts/actions'), analytics = require('lib/analytics');

module.exports = {
    getInitialState: function() {
        return {
            updated: false,
            updatedStatus: null,
            previousStatus: null,
        };
    },

    buildUpdateTemplate: function() {
        var post = this.props.post || this.props.page,
            status = this.state.updatedStatus,
            updateClass = 'conf-alert',
            strings = this.strings,
            updateText,
            undoTemplate,
            undoClick,
            trashText;

        if (!this.state.updated) {
            return;
        }

        switch (status) {
            case 'trashing':
            case 'deleting':
                trashText = status === 'deleting' ? strings.deleting : strings.trashing;
                updateText = (
                    <span>
                        {trashText}
                        {' '}
                        <span className="loading-dot">.</span>
                        <span className="loading-dot">.</span>
                        <span className="loading-dot">.</span>
                    </span>
                );
                updateClass += ' conf-alert--trashing';
                break;
            case 'trash':
                // No need to bind onClick
                // http://facebook.github.io/react/blog/2013/07/02/react-v0-4-autobind-by-default.html
                undoClick = this.resetToPreviousState;
                undoTemplate = (
                    <a className="undo" onClick={undoClick}><span>{strings.undo}</span></a>
                );
                updateText = strings.trashed;
                updateClass += ' conf-alert--trashed';
                break;
            case 'deleted':
                updateText = strings.deleted;
                updateClass += ' conf-alert--deleted';
                break;
            case 'updating':
                updateText = (
                    <span>
                        {strings.updating}
                        {' '}
                        <span className="loading-dot">.</span>
                        <span className="loading-dot">.</span>
                        <span className="loading-dot">.</span>
                    </span>
                );
                updateClass += ' conf-alert--updating';
                break;
            case 'error':
                updateText = strings.error;
                updateClass += ' conf-alert--error';
                break;
            case 'restoring':
                updateText = (
                    <span>
                        {strings.restoring}
                        {' '}
                        <span className="loading-dot">.</span>
                        <span className="loading-dot">.</span>
                        <span className="loading-dot">.</span>
                    </span>
                );
                updateClass += ' conf-alert--updating';
                break;
            default:
                if (this.state.previousStatus === 'trash') {
                    updateText = strings.restored;
                } else {
                    updateText = strings.updated;
                }
        }

        return (
            <div key={post.global_ID + '-update'} className="updated-confirmation">
                <div className={updateClass}>
                    <div className="conf-alert_con">
                        <span className="conf-alert_title">{updateText}</span>{undoTemplate}
                    </div>
                </div>
            </div>
        );
    },

    updatePostStatus: function(status) {
        var post = this.props.post || this.props.page,
            previousStatus = null,
            strings = this.strings,
            setNewStatus;

        setNewStatus = function(error, post) {
            if (error) {
                this.setErrorState();
                return false;
            }
            this.setState({
                previousStatus: previousStatus,
                updatedStatus: post.status,
                showMoreOptions: false,
            });
            return true;
        }.bind(this);

        if (status === 'delete') {
            this.setState({
                updatedStatus: 'deleting',
                updated: true,
            });

            if (window.confirm(strings.deleteWarning)) {
                // eslint-disable-line no-alert
                actions.trash(post, setNewStatus);
            } else {
                this.resetState();
            }
        } else if (status === 'trash') {
            this.setState({
                updatedStatus: 'trashing',
                updated: true,
            });
            previousStatus = post.status;
            actions.trash(post, setNewStatus);
        } else if (status === 'restore') {
            this.setState({
                updatedStatus: 'restoring',
                updated: true,
            });
            previousStatus = 'trash';
            actions.restore(post, setNewStatus);
        } else {
            this.setState({
                updatedStatus: 'updating',
                updated: true,
            });
            actions.update(
                post,
                { status: status },
                function(error, post) {
                    if (!setNewStatus(error, post)) {
                        return;
                    }
                    setTimeout(
                        function() {
                            this.resetState();
                        }.bind(this),
                        1200
                    );
                }.bind(this)
            );
        }
    },

    setErrorState: function() {
        this.setState({
            updated: true,
            updatedStatus: 'error',
        });
        setTimeout(
            function() {
                this.resetState();
            }.bind(this),
            1200
        );
    },

    resetState: function() {
        this.setState({
            updatedStatus: null,
            updated: false,
            showMoreOptions: false,
            showPageActions: false,
        });
    },

    resetToPreviousState: function() {
        var analyticsValues = this.props.page
            ? { group: 'Pages', eventName: 'Clicked Undo Trashed Page' }
            : { group: 'Posts', eventName: 'Clicked Undo Trashed Post' };
        analytics.ga.recordEvent(analyticsValues.group, analyticsValues.eventName);
        if (this.state.previousStatus) {
            this.updatePostStatus(this.state.previousStatus);
        }
    },
};
