'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _section = require('./section');

var _section2 = _interopRequireDefault(_section);

var _mixin = require('react-pure-render/mixin');

var _mixin2 = _interopRequireDefault(_mixin);

var _githubSlugger = require('github-slugger');

var _githubSlugger2 = _interopRequireDefault(_githubSlugger);

var _custom = require('../custom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var slugger = new _githubSlugger2.default();
var slug = function slug(title) {
  slugger.reset();return slugger.slug(title);
};

var roundedToggleOptionType = _react2.default.PropTypes.shape({
  title: _react2.default.PropTypes.string,
  value: _react2.default.PropTypes.string
});

function chunkifyAST(ast, language) {
  var preview = false;
  return ast.children.reduce(function (chunks, node) {
    if (node.type === 'heading' && node.depth === 1) {
      return chunks;
    } else if (node.type === 'heading' && node.depth < 4) {
      chunks.push([node]);
    } else {
      chunks[chunks.length - 1].push(node);
    }
    return chunks;
  }, [[]]).filter(function (chunk) {
    return chunk.length;
  }).map(function (chunk) {
    var left = [],
        right = [],
        title;
    if (language === 'cli') {
      language = 'bash';
    }
    if (chunk[0].depth < 3) {
      preview = false;
    }
    chunk.forEach(function (node) {
      if (node.type === 'code') {
        if (node.lang === 'json' || node.lang === 'http' || node.lang === 'html') {
          right.push(node);
        } else if (node.lang === language) {
          if (language === 'curl') {
            right.push(_extends({}, node, { lang: 'bash' }));
          } else {
            right.push(node);
          }
        } else if (node.lang === 'endpoint') {
          right.push((0, _custom.transformURL)(node.value));
        } else if (node.lang === null) {
          left.push(node);
        }
      } else if (node.type === 'heading' && node.depth >= 4) {
        right.push(node);
      } else if (node.type === 'blockquote') {
        right.push(node);
      } else if (node.type === 'heading' && node.depth < 4 && !title) {
        title = node.children[0].value;
        left.push(node);
      } else if (node.type === 'html') {
        if (node.value.indexOf('<!--') === 0) {
          var content = node.value.replace(/^<!--/, '').replace(/-->$/, '').trim();
          if (content === 'preview') {
            preview = true;
          }
        }
      } else {
        left.push(node);
      }
    });
    return { left: left, right: right, title: title, preview: preview, slug: slug(title) };
  });
}

var Content = _react2.default.createClass({
  displayName: 'Content',

  mixins: [_mixin2.default],
  propTypes: {
    ast: _react2.default.PropTypes.object.isRequired,
    language: roundedToggleOptionType,
    leftClassname: _react2.default.PropTypes.string.isRequired,
    rightClassname: _react2.default.PropTypes.string.isRequired
  },
  render: function render() {
    var _props = this.props;
    var ast = _props.ast;
    var language = _props.language;
    var leftClassname = _props.leftClassname;
    var rightClassname = _props.rightClassname;

    return _react2.default.createElement(
      'div',
      { className: 'clearfix' },
      chunkifyAST(ast, language.value).map(function (chunk, i) {
        return _react2.default.createElement(_section2.default, {
          leftClassname: leftClassname,
          rightClassname: rightClassname,
          chunk: chunk,
          key: i });
      })
    );
  }
});

module.exports = Content;