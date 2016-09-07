'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _mixin = require('react-pure-render/mixin');

var _mixin2 = _interopRequireDefault(_mixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NavigationItem = _react2.default.createClass({
  displayName: 'NavigationItem',

  mixins: [_mixin2.default],
  propTypes: {
    sectionName: _react2.default.PropTypes.string.isRequired,
    active: _react2.default.PropTypes.bool.isRequired,
    onClick: _react2.default.PropTypes.func.isRequired,
    href: _react2.default.PropTypes.string.isRequired
  },
  onClick: function onClick() {
    this.props.onClick(this.props.sectionName);
  },
  render: function render() {
    var _props = this.props;
    var sectionName = _props.sectionName;
    var href = _props.href;
    var active = _props.active;

    return _react2.default.createElement(
      'a',
      {
        href: href,
        onClick: this.onClick,
        className: 'line-height15 pad0x pad00y quiet block ' + (active ? 'fill-lighten0 round' : '') },
      sectionName
    );
  }
});

module.exports = NavigationItem;