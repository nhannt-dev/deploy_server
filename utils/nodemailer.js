const nodemailer = require('nodemailer')

const option = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASSWORD
    }
}

const transporter = nodemailer.createTransport(option)

exports.sendEmail = async ({ to, subject, text, html, ...rest }) => {
    try {
      const res = await transporter.verify()
      if (res) {
        const mail = {
          from: '"Fphone Store" <no-reply@accounts.fphone-store.com>',
          to,
          subject,
          text,
          html,
          ...rest
        }
        const info = await transporter.sendMail(mail)
        if (info) {
          return true
        }
      }
    } catch (err) {
        console.error('ERROR MAILER: ', err)
      return false
    }
}

const headerHtmlMail = `<h1 style="color: #4c649b; font-size: 48px; border-bottom: solid 2px #ccc;padding-bottom: 10px">
      Fphone Store<br />
    </h1>`

const footerHtmlVerifyMail = `<h3 style="color: red">
        Chú ý: Không đưa mã này cho bất kỳ ai,
        có thể dẫn đến mất tài khoản.<br />
        Mã chỉ có hiệu lực <i>10 phút </i> từ lúc bạn nhận được mail này.
    </h3>
    <h1>Xin trân trọng cảm ơn.</h1>`

exports.htmlSignupAccount = (token) => {
    return `<div>
        ${headerHtmlMail}
        <h2 style="padding: 10px 0; margin-bottom: 10px;">
            Xin chào anh (chị),<br />
            Mã xác nhận đăng ký tài khoản cho website Fphone Store của anh (chị).<br />
            Cảm ơn vì đã ghé thăm Fphone Store <3
        </h2>
        <h3 style="background: #eee;padding: 10px;">
        <i><b>${token}</b></i>
        </h3>
    ${footerHtmlVerifyMail}
    </div>`
}

exports.htmlResetPassword = (token) => {
  return `<div>
    ${headerHtmlMail}
    <h2 style="padding: 10px 0; margin-bottom: 10px;">
        Xin chào anh (chị),<br />
        Cửa hàng Fphone Store đã nhận được yêu cầu lấy lại mật khẩu từ quý khách.<br />
        Quý khách vui lòng nhập mã xác nhận này để khôi phục tài khoản:
    </h2>
    <h1 style="background: #eee;padding: 10px;">
      <i><b>${token}</b></i>
    </h1>
    ${footerHtmlVerifyMail}
  </div>`
}