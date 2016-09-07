'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _remark = require('remark');

var _remark2 = _interopRequireDefault(_remark);

var _remarkHtml = require('remark-html');

var _remarkHtml2 = _interopRequireDefault(_remarkHtml);

var _highlight = require('../highlight');

var _highlight2 = _interopRequireDefault(_highlight);

var _mixin = require('react-pure-render/mixin');

var _mixin2 = _interopRequireDefault(_mixin);

var _custom = require('../custom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderHighlighted(nodes) {
  return {
    __html: (0, _custom.postHighlight)((0, _remark2.default)().use(_remarkHtml2.default).stringify((0, _remark2.default)().use(_highlight2.default).use(_custom.remarkPlugins).run({
      type: 'root',
      children: nodes
    })))
  };
}

var Section = _react2.default.createClass({
  displayName: 'Section',

  mixins: [_mixin2.default],
  propTypes: {
    chunk: _react2.default.PropTypes.object.isRequired,
    leftClassname: _react2.default.PropTypes.string.isRequired,
    rightClassname: _react2.default.PropTypes.string.isRequired
  },
  render: function render() {
    var _props = this.props;
    var chunk = _props.chunk;
    var leftClassname = _props.leftClassname;
    var rightClassname = _props.rightClassname;
    var left = chunk.left;
    var right = chunk.right;
    var preview = chunk.preview;

    return _react2.default.createElement(
      'div',
      {
        'data-title': chunk.title,
        className: 'keyline-top section contain clearfix ' + (preview ? 'preview' : '') },
      _react2.default.createElement('div', {
        className: leftClassname,
        dangerouslySetInnerHTML: renderHighlighted(left) }),
      right.length > 0 && _react2.default.createElement('div', {
        className: rightClassname,
        dangerouslySetInnerHTML: renderHighlighted(right) })
    );
  }
});

module.exports = Section;