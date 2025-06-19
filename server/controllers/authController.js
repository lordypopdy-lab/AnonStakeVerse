const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const OtpModel = require("../models/OtpModel");
const bankModel = require("../models/bankModel");
const chatModel = require("../models/chatModel");
const cryptoModel = require("../models/cryptoModel");
const adminMessage = require("../models/adminMessage");
const accountUpgradeModel = require("../models/accountLevel");
const userInfomation = require("../models/userInformation");
const NotificationModel = require("../models/notification");
const { hashPassword, comparePassword } = require("../helpers/auth");

const nodemailer = require('nodemailer');


const createNotification = async (req, res) => {
  const { email, For } = req.body;

  const NotificationList = {
    activationHeader: "Contract Activated! 🎉",
    activationMessage:
      "Your contract has been successfully ✅ activated.We are excited 😍 to support you and ensure a seamless experience. Enjoy the benefits of your new contract!",
    reActivationHeader: "Contract Reactivated! 🎉",
    reActivationMessage:
      "Your contract has been successfully ✅ reactivated. We are thrilled 😇 to have you back! Enjoy the continued benefits and services. Thank you for choosing us again!",
    pauseAndWithdrawHeader: "Contract Paused and Withdrawn! 🎉",
    pauseAndWithdrawMessage:
      "Your contract has been successfully ✅ paused and withdrawn",
    sendHeader: "Success! 👍",
    sendMessage: "Ethers has been sent successfully. Transaction completed ✅",
    getProfitHeader: "Success! 👍",
    getProfitMessage:
      "Ethers has been sent successfully. Profit withdrawn successfully. Transaction completed ✅",
    verificationHeader: "Submitted Successfully! ✅",
    verificationMessage:
      "Thank you for submitting your ID for verification. We have received your documents, and they are currently under review. You will be notified once the verification process is complete.",
  };

  const timestamp = new Date().getTime();


  if (email && For == "IDverification") {
    const createNew = await NotificationModel.create({
      email,
      For: For,
      message: NotificationList.verificationMessage,
      header: NotificationList.verificationHeader,
      timestamp: timestamp,
    });

    const user = await User.findOne({ email });
    const updateUserNotification = await User.updateOne(
      { email: email },
      { $set: { NotificationSeen: `${1 + user.NotificationSeen}` } }
    );
    if (createNew && updateUserNotification) {
      return res.json({
        success: "Success",
      });
    }
  }

  if (email && For == "sendSuccess") {
    const createNew = await notificationModel.create({
      email,
      For: For,
      message: NotificationList.sendMessage,
      header: NotificationList.sendHeader,
      timestamp: timestamp,
    });

    const user = await User.findOne({ email });
    const updateUserNotification = await User.updateOne(
      { email: email },
      { $set: { NotificationSeen: `${1 + user.NotificationSeen}` } }
    );
    if (createNew && updateUserNotification) {
      const { valueSend, amount } = req.body;

      const timestamp = new Date().getTime();
      const type = "Sent";
      const Status = "Success";
      const valueEth = valueSend;
      const valueUsd = amount;

      const CreateHistory = await history.create({
        email,
        type,
        Status,
        valueEth,
        valueUsd,
        timestamp,
      });
      if (CreateHistory) {
        return res.json({
          success: "Success",
        });
      }
    }
  } else {
    return res.json({
      error: "Error Creating Notification for Sending",
    });
  }
};

const DeclineKyc = async (req, res) => {
  const { kycDecline } = req.body;

  const kycDec = await OtpModel.updateOne({_id: kycDecline}, {$set: {kycStatus: "Declined"}});
  if(kycDec){
    return res.json({
      success: "Kyc Declined Successfully!"
    })
  }

  return res.json({
    error: "Error Declining Kyc"
  })
}

const DeleteKyc = async (req, res) => {
  const { kycAction } = req.body;
  const deleteAction = await OtpModel.deleteOne({_id: kycAction});

  if(deleteAction){
    return res.json({
      success: "Kyc Request deleted succesfully!"
    })
  }

  return res.json({
    error: "Error Deleting Kyc Request"
  })
}

const ApproveKyc = async (req, res) => {
  const { kycApprove } = req.body;

  const kycDec = await OtpModel.updateOne({_id: kycApprove}, {$set: {kycStatus: "Approved"}});
  if(kycDec){
    return res.json({
      success: "Kyc Approved Successfully!"
    })
  }

  return res.json({
    error: "Error Approving Kyc"
  })
}

const fetchAllKyc = async (req, res) => {
  const kyc = await OtpModel.find({});
  return res.json({
    kyc: kyc
  })
}

const fetchKyc = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({
      error: "Email Required!"
    })
  }

  const ifVerifiedOtp = await OtpModel.findOne({ email: email });

  if (ifVerifiedOtp && ifVerifiedOtp.kycStatus === "Verified") {
    return res.json({
      status: "Verified"
    })
  }

  if (ifVerifiedOtp && ifVerifiedOtp.kycStatus === "Inreview") {
    return res.json({
      status: "Inreview"
    })
  }

  return res.json({
    status: "Unverified"
  })
}

const fetchOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({
      error: "Email Required!"
    })
  }

  const ifVerifiedOtp = await OtpModel.findOne({ email: email });

  if (ifVerifiedOtp && ifVerifiedOtp.status === "Verified") {
    return res.json({
      status: "Verified"
    })
  }

  return res.json({
    status: "Unverified"
  })
}

const verifyOtp = async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.json({
      error: "Please Enter OTP Code before submiting!"
    })
  }

  const ifCorrect = await OtpModel.findOne({ Otp: otp });
  if (!ifCorrect) {
    return res.json({
      error: "Incorrect OTP, Please Re-Check Yout E-Mail for New OTP"
    })
  }

  await OtpModel.updateOne({ Otp: otp }, { $set: { status: "Verified" } });
  return res.status(200).json({
    success: "Successfuly Verified OTP"
  })
}

const getOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({
      error: "email is required to request for OTP"
    })
  }

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  const sendOTP = async (email) => {
    const otp = generateOTP();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Hi [${email}],
Your verification code is:

[${otp}]

Enter this code to verify your email address.
This code will expire in 15 minutes.

If you didn’t request this, you can ignore the email.

Thanks.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      const ifExist = await OtpModel.findOne({ email: email });
      if (ifExist) {
        await OtpModel.updateOne({ email: email }, { $set: { Otp: otp } })
        console.log(`OTP Exist, sent successfully to ${email}: ${otp}`);
        return res.json({
          message: "OTP Sent Successfully!",
          OTP: otp
        })
      }

      await OtpModel.create({
        email: email,
        Otp: otp
      })

      console.log(`OTP Created, sent successfully to ${email}: ${otp}`);
      return res.json({
        message: "OTP Sent Successfully!",
        OTP: otp
      })

    } catch (error) {
      console.error("Error sending OTP:", error);
      return null;
    }
  };

  const userEmail = email; // Replace with user's email
  sendOTP(userEmail)

}

const userInfo = async (req, res) => {
  const { email, Id, Country } = req.body;
  const check = await userInfomation.findOne({ email });
  if (check) {
    const update = await userInfomation.updateOne(
      { email: email },
      { $set: { email: `${email}`, Id: `${Id}`, Country: `${Country}` } }
    );
    if (update) {
      return res.json({
        message: "Updated",
      });
    }
  }
  const create = await userInfomation.create({
    email,
    Id,
    Country,
  });
  if (create) {
    return res.json({
      message: "success",
    });
  }
};

const citizenId = async (req, res) => {
  const { email, imgSrc } = req.body;

  const checkIF = await OtpModel.findOne({ email: email });

  if (checkIF) {
    await OtpModel.updateOne({ email: email }, { $set: {kycStatus: "Inreview", kycPic: imgSrc} });
    const updateUserPic = await userInfomation.updateOne(
      { email: email },
      { $set: { IdProfile: imgSrc } }
    );
    const updateUser = await User.updateOne(
      { email: email },
      { $set: { citizenId: `${imgSrc}`, verification: `Inreview` } }
    );
    if (updateUser && updateUserPic) {
      return res.json({
        success: "Success",
      });
    }
  } else {
    await OtpModel.create({
      email: email,
      Otp: "",
      status: "Unverified",
      kycStatus: "Inreview",
      kycPic: imgSrc
    })

    const updateUserPic = await userInfomation.updateOne(
      { email: email },
      { $set: { IdProfile: imgSrc } }
    );
    const updateUser = await User.updateOne(
      { email: email },
      { $set: { citizenId: `${imgSrc}`, verification: `Inreview` } }
    );
    if (updateUser && updateUserPic) {
      return res.json({
        success: "Success",
      });
    }
  }

};

//-------------------------------------------------------

const getAccountLevel = async (req, res) => {
      const {ID} = req.body;
      const ifExist = await accountUpgradeModel.findOne({userID: ID});

      if(ifExist){
        return res.json({
          Level: ifExist
        })
      }

}

const upgradeAccount = async (req, res) => {
  try {
    const { ID, ULevel } = req.body;

    if (!mongoose.Types.ObjectId.isValid(ID)) {
      return res.json({ error: "Invalid user ID format" });
    }

    const checkUser = await User.findById(ID);
    if (!checkUser) {
      return res.status(404).json({ error: "User ID not found" });
    }

    const ifExist = await accountUpgradeModel.findOne({ userID: ID });

    if (!ifExist) {

      await accountUpgradeModel.create({
        userID: ID,
        accountLevel: ULevel,
      });

      return res.json({
        success: `User ${ID} has been upgraded to ${ULevel}`,
      });
    }

    if (ifExist.accountLevel === ULevel) {
      return res.json({
        error: `User account is already at ${ifExist.accountLevel}`,
      });
    }

    await accountUpgradeModel.updateOne({ userID: ID }, { $set: { accountLevel: ULevel } });

    return res.json({
      success: `User ${ID} has been upgraded to ${ULevel}`,
    });
  } catch (error) {
    console.error("Error upgrading account:", error);
    return res.json({ error: "Internal server error" });
  }
};


const getMessage = async (req, res) => {
  const { ID } = req.body;

  const getNoti = await adminMessage.findOne({ userID: ID });

  if (getNoti) {
    return res.json(getNoti)
  }

  return res.json({ data: "No data" });
}

const getNotification = async (req, res) => {
  const { ID } = req.body;
  const getNoti = await adminMessage.findOne({ userID: ID });

  if (getNoti) {
    return res.json(getNoti)
  }

  return res.json({ data: "No data" });
}

const Delete = async (req, res) => {
  const { isDelete } = req.body;

  const checkBank = await bankModel.findOne({ _id: isDelete });
  const checkCrypto = await cryptoModel.findOne({ _id: isDelete });

  if (checkBank) {
    await bankModel.deleteOne({ _id: isDelete })
    return res.json({
      success: "Transaction Deleted Successfully!"
    })
  }

  if (checkCrypto) {
    await cryptoModel.deleteOne({ _id: isDelete });
    return res.json({
      success: "Transaction Deleted Successfully!"
    })
  }

  return res.json({
    error: "Unidentify transaction ID"
  })

}

const Approve = async (req, res) => {
  const { isApprove } = req.body;

  const checkBank = await bankModel.findOne({ _id: isApprove });
  const checkCrypto = await cryptoModel.findOne({ _id: isApprove });

  if (checkBank) {
    await bankModel.updateOne({ _id: isApprove }, { $set: { status: "Approved" } });
    return res.json({
      success: "Transaction approved Successfully!"
    })
  }

  if (checkCrypto) {
    await cryptoModel.updateOne({ _id: isApprove }, { $set: { status: "Approved" } });
    return res.json({
      success: "Transaction Approved Successfully!"
    })
  }

  return res.json({
    error: "Unidentify transaction ID"
  })

}

const Decline = async (req, res) => {
  const { isDecline } = req.body;

  const checkBank = await bankModel.findOne({ _id: isDecline });
  const checkCrypto = await cryptoModel.findOne({ _id: isDecline });

  if (checkBank) {
    await bankModel.updateOne({ _id: isDecline }, { $set: { status: "Declined" } });
    return res.json({
      success: "Transaction Declined Successfully!"
    })
  }

  if (checkCrypto) {
    await cryptoModel.updateOne({ _id: isDecline }, { $set: { status: "Declined" } });
    return res.json({
      success: "Transaction Declined Successfully!"
    })
  }

  return res.json({
    error: "Unidentify transaction ID"
  })

}

const userNotification = async (req, res) => {
  const { id, value } = req.body;
  if (!id) {
    return res.json({
      error: "userID and notification field is required! to send Message"
    })
  }

  if (!value) {
    return res.json({
      error: "userID and notification field is required! to send Message"
    })
  }

  check01 = await adminMessage.findOne({ userID: id });
  if (check01) {
    await adminMessage.updateOne({ userID: id }, { $set: { notification: value } });
    return res.json({
      success: "Notification sent"
    })
  }

  await adminMessage.create({
    userID: id,
    notification: value,
  })

  return res.json({
    success: "Notification sent"
  })
}

const notificationAdder = async (req, res) => {
  const { id, value } = req.body;

  if (!id) {
    return res.json({
      error: "userID and message field is required! to send Message"
    })
  }

  if (!value) {
    return res.json({
      error: "userID and message field is required! to send Message"
    })
  }

  check01 = await adminMessage.findOne({ userID: id });
  if (check01) {
    await adminMessage.updateOne({ userID: id }, { $set: { submitMessage: value } });
    return res.json({
      success: "message sent"
    })
  }

  await adminMessage.create({
    userID: id,
    submitMessage: value,
  })

  return res.json({
    success: "message sent"
  })
}

const deleteChat = async (req, res) => {
  const { id } = req.body;
  const deleted = await chatModel.deleteOne({ _id: id });
  if (deleted) {
    return res.json({
      success: "Chat Deleted"
    })
  }
}

const chatSend = async (req, res) => {
  const { value, from, email } = req.body;

  if (!value) {
    return res.json({
      error: "Message field is required"
    })
  }

  if (!from) {
    return res.json({
      error: "unidentified User"
    })
  }

  if (!email) {
    return res.json({
      error: "Email Not Found"
    })
  }
  const createNewChat = await chatModel.create({
    from: from,
    email: email,
    message: value,
    tmp_stp: new Date()
  })

  if (createNewChat) {
    const chat = await chatModel.find({ email: email });
    return res.json({
      chat: chat
    })
  }
}

const getAdminChat = async (req, res) => {
  const { email } = req.body;

  const getChat = await chatModel.find({ email: email });
  if (getChat) {
    return res.json({
      chat: getChat
    });
  }

  res.json({
    message: "No Chat Available"
  })
}

const AdminGetCrypto = async (req, res) => {
  const { email } = req.body;
  const ifAdmin = await Admin.findOne({ email: email });
  if (ifAdmin) {
    const bankR = await cryptoModel.find();
    return res.json(bankR)
  }

  return res.json({
    error: "Unidentify Admin 404"
  })
}

const AdminGetBankR = async (req, res) => {
  const { email } = req.body;

  const ifAdmin = await Admin.findOne({ email: email });
  if (ifAdmin) {
    const bankR = await bankModel.find();
    return res.json(bankR)
  }

  return res.json({
    error: "Unidentify Admin 404"
  })
}

const getCryptoRecords = async (req, res) => {
  const { email } = req.body;
  const find = await cryptoModel.find({ email: email });

  if (find) {
    return res.json(find)
  }

  return res.json({});
}

const getBankRecords = async (req, res) => {
  const { email } = req.body;

  const find = await bankModel.find({ email: email });

  if (find) {
    return res.json(find)
  }

  return res.json({});
}

const getUser = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.json({
      error: "unidentyfied user",
    });
  }
  return res.json(user);
};

const withdrawCrypto = async (req, res) => {
  const { email, value, walletAddress } = req.body;

  if (!value || value <= 10) {
    return res.json({
      error: "Amount must be provided and must be greater than 10",
    });
  }

  if (!walletAddress) {
    return res.json({
      error: "A valid wallet address is required",
    });
  }

  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    return res.status(404).json({
      error: "Invalid request, Unidentify user",
    });
  }

  if (findUser.deposit >= value) {
    await cryptoModel.create({
      amount: value,
      email: email,
      cryptoAddress: walletAddress,
      reg_date: new Date(),
    });

    await User.updateOne({ email: email }, { $inc: { deposit: -value } });
    return res.json({
      success: "withdrawal request sent",
    });
  }

  if (findUser.profit >= value) {
    await cryptoModel.create({
      amount: value,
      cryptoAddress: walletAddress,
      email: email,
      reg_date: new Date(),
    });

    await User.updateOne({ email: email }, { $inc: { profit: -value } });
    return res.json({
      success: "withdrawal request sent",
    });
  }

  if (findUser.bonuse >= value) {
    await cryptoModel.create({
      amount: value,
      cryptoAddress: walletAddress,
      email: email,
      reg_date: new Date(),
    });

    await User.updateOne({ email: email }, { $inc: { bonuse: -value } });
    return res.json({
      success: "withdrawal request sent",
    });
  }

  if (findUser.deposit <= value) {
    return res.json({
      error: "Insufficient Balance!",
    });
  }

  if (findUser.profit <= value) {
    return res.json({
      error: "Insufficient Balance!",
    });
  }

  if (findUser.bonuse <= value) {
    return res.json({
      error: "Insufficient Balance!",
    });
  }
};

const withdrawBank = async (req, res) => {
  const { email, value, bank_name, account_name, account_number, swift_code } =
    req.body;

  if (!value || value <= 10) {
    return res.json({
      error: "Amount is required and must be greater than 10",
    });
  }

  if (!bank_name) {
    return res.json({
      error: "Bank name must be provided, to sign Withdrawal",
    });
  }

  if (!account_name) {
    return res.json({
      error: "Account Name must be provided, to sign Withdrawal",
    });
  }

  if (!account_number) {
    return res.json({
      error: "Account number must be provided, to sign Withdrawal",
    });
  }

  if (!swift_code) {
    return res.json({
      error: "Swift-Code must be provided, to sign Withdrawal",
    });
  }

  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    return res.status(404).json({
      error: "Invalid request, Unidentify user",
    });
  }

  console.log(findUser.deposit);
  if (findUser.deposit >= value) {
    await bankModel.create({
      amount: value,
      bank: bank_name,
      name: account_name,
      swiftCode: swift_code,
      email: email,
      reg_date: new Date(),
    });

    await User.updateOne({ email: email }, { $inc: { deposit: -value } });
    return res.json({
      success: "withdrawal request sent",
    });
  }

  if (findUser.profit >= value) {
    await bankModel.create({
      amount: value,
      bank: bank_name,
      name: account_name,
      swiftCode: swift_code,
      email: email,
      reg_date: new Date(),
    });

    await User.updateOne({ email: email }, { $inc: { profit: -value } });
    return res.json({
      success: "withdrawal request sent",
    });
  }

  if (findUser.bonuse >= value) {
    await bankModel.create({
      amount: value,
      bank: bank_name,
      name: account_name,
      swiftCode: swift_code,
      email: email,
      reg_date: new Date(),
    });

    await User.updateOne({ email: email }, { $inc: { bonuse: -value } });
    return res.json({
      success: "withdrawal request sent",
    });
  }

  if (findUser.deposit <= value) {
    return res.json({
      error: "Insufficient Balance!",
    });
  }

  if (findUser.profit <= value) {
    return res.json({
      error: "Insufficient Balance!",
    });
  }

  if (findUser.bonuse <= value) {
    return res.json({
      error: "Insufficient Balance!",
    });
  }
};

const addBalance = async (req, res) => {
  const { id, value, type } = req.body;

  if (!id) {
    return res.json({
      error: "user ID must be provided!",
    });
  }

  if (!value || value < 1) {
    return res.json({
      error: "value to be added is needed and must be greater than 0",
    });
  }

  if (type == "deposit") {
    await User.updateOne({ _id: id }, { $set: { deposit: value } });
    return res.status(200).json({
      success: "Deposit Balance Added Successfully!",
    });
  }

  if (type == "bonuse") {
    await User.updateOne({ _id: id }, { $set: { bonuse: value } });
    return res.status(200).json({
      success: "Bonuse Balance Added Successfully!",
    });
  }

  if (type == "profit") {
    await User.updateOne({ _id: id }, { $set: { profit: value } });
    return res.status(200).json({
      success: "Profit Balance Added Successfully!",
    });
  }
};

const getUsers = async (req, res) => {
  const users = await User.find();
  if (User.countDocuments < 1) {
    return res.status(404).json({
      message: "No User Found",
    });
  }

  return res.json(users);
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.json({
        error: "email is required",
      });
    }

    //Check if password is goood
    if (!password || password.length < 6) {
      return res.json({
        error: "password is required and should be atleast six(6) characters",
      });
    }

    //Check if user exist
    const user = await Admin.findOne({ email });
    const adminCount = await Admin.countDocuments();
    if (!user && adminCount < 1) {
      const hashedPassword = await hashPassword(password);
      await Admin.create({
        name: "Admin",
        email: "example@gmail.com",
        password: hashedPassword,
        req_date: new Date(),
      });
      return res.json({
        new: "New admin created Contact lordy-popdy for Details!",
      });
    }
    //Check if password match
    const match = await comparePassword(password, user.password);
    if (match) {
      jwt.sign(
        { name: user.name, email: user.email, id: user._id },
        process.env.JWT_SECRET,
        {},
        (error, token) => {
          if (error) throw error;
          res.cookie("token", token).json(user);
        }
      );
    }
    if (!match) {
      return res.json({
        error:
          "password not match our database, password should be atleast six(6) character",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    //Check if user exist
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "No user found",
      });
    }
    //Check if password match
    const match = await comparePassword(password, user.password);
    if (match) {
      jwt.sign(
        { name: user.name, email: user.email, id: user._id },
        process.env.JWT_SECRET,
        {},
        (error, token) => {
          if (error) throw error;
          res.cookie("token", token).json(user);
        }
      );
    }
    if (!match) {
      return res.json({
        error:
          "password not match our database, password should be atleast six(6) character",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const test = async (req, res) => {
  return res.status(200).json({ message: "Connected Succesfully!" });
};

const createUser = async (req, res) => {
  const {
    name,
    email,
    country,
    currency,
    account,
    password,
    comfirm_password,
  } = req.body;
  try {
    //Check if name was taken
    if (!name) {
      return res.json({
        error: "name is required",
      });
    }

    //check if email is provided
    if (!email) {
      return res.json({
        error: "email is required!",
      });
    }

    //check if country is provided
    if (!country) {
      return res.json({
        error: "country is required!",
      });
    }

    //check if currency is provided
    if (!currency) {
      return res.json({
        error: "currency is required!",
      });
    }

    //check if country is provided
    if (!account) {
      return res.json({
        error: "account is required!",
      });
    }

    //Check if password is goood
    if (!password || password.length < 6) {
      return res.json({
        error: "password is required and should be atleast six(6) characters",
      });
    }

    //Check comfirmPassword
    if (password !== comfirm_password) {
      return res.json({
        error: "Comfirm password must match password",
      });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: "email is taken",
      });
    }

    // const adminTotalUserUpdate = await Admin.updateOne(
    //   { adminEmail: "bitclubcontract@gmail.com" },
    //   { $inc: { totalUser: 1 } }
    // );

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: name,
      email: email,
      country: country,
      currency: currency,
      account: account,
      password: hashedPassword,
      req_date: new Date(),
    });

    console.log(user);
    if (user) {
      return res.json(user);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  test,
  Delete,
  Approve,
  getUser,
  Decline,
  getUsers,
  chatSend,
  deleteChat,
  loginUser,
  getMessage,
  createUser,
  loginAdmin,
  DeclineKyc,
  DeleteKyc,
  ApproveKyc,
  fetchAllKyc,
  fetchKyc,
  fetchOTP,
  verifyOtp,
  getOTP,
  userInfo,
  citizenId,
  addBalance,
  getAdminChat,
  withdrawBank,
  AdminGetBankR,
  upgradeAccount,
  getAccountLevel,
  getNotification,
  AdminGetCrypto,
  withdrawCrypto,
  getBankRecords,
  getCryptoRecords,
  userNotification,
  createNotification,
  notificationAdder,
};
