import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { Button } from 'antd'
import './style.less'

// 添加按钮
// props: path，指定的点击后跳转的url
class AddButton extends React.Component {
  handleAdd = () => {
    // const { path, history } = this.props;
    // history.push(path);
  }

  render() {
    const { type, btnText } = this.props
    return (
      <Button
        onClick={this.handleAdd}
        type={type}
      >
        {btnText}
      </Button>
    )
  }
}
AddButton.propTypes = {
  type: PropTypes.string.isRequired,
  btnText: PropTypes.string.isRequired,
  // path: PropTypes.string.isRequired,
  // history: PropTypes.object.isRequired,
}
export default withRouter(AddButton)
