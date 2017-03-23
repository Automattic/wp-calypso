/**
 * External dependencies
 */
var React = require('react'),
    classNames = require('classnames'),
    debug = require('debug')('calypso:menus:save-button'); // eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var analytics = require('lib/analytics');

var MenuSaveButton = React.createClass({
    componentWillMount: function() {
        this.props.menuData.on('saved', this.setSaved);
        this.props.menuData.on('error', this.setSaved);
    },

    componentWillUnmount: function() {
        this.props.menuData.off('saved', this.setSaved);
        this.props.menuData.off('error', this.setSaved);
    },

    getInitialState: function() {
        return { saving: false };
    },

    setSaving: function() {
        this.setState({ saving: true });
    },

    setSaved: function() {
        this.setState({ saving: false });
    },

    save: function() {
        analytics.ga.recordEvent('Menus', 'Clicked Save Menu Button');

        this.setSaving();
        return this.props.menuData.saveMenu(this.props.selectedMenu);
    },

    render: function() {
        var hasChanged = this.props.menuData.get().hasChanged,
            classes = classNames({
                button: true,
                'is-primary': true,
                saving: this.state.saving,
            });

        return (
            <button className={classes} disabled={!hasChanged} onClick={this.save}>
                {this.state.saving ? this.translate('Saving…') : this.translate('Save')}
            </button>
        );
    },
});

module.exports = MenuSaveButton;
