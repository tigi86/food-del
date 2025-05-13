import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";
const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} alt="" className="logo" />
          <p>
            you can find us for any website related projects and jobs we are
            ready to work any website frontend or backend or full-stack web
            development
          </p>
          <div className="footer-soial-icons">
            <img src={assets.linkedin_icon} alt="" />
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+251986121480</li>
            <li>tigistuyohannes86@gmail.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        copyright 2024 Tigistu - All Right Reserved.
      </p>
    </div>
  );
};

export default Footer;
