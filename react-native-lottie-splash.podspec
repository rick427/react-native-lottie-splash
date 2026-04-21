require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-lottie-splash"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/yourusername/react-native-lottie-splash"
  s.license      = package["license"]
  s.authors      = { "Your Name" => "your@email.com" }
  s.platforms    = { :ios => "13.4" }
  s.source       = { :git => "https://github.com/yourusername/react-native-lottie-splash.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.exclude_files = "ios/build"

  # Automatically links React Native dependencies and enables New Architecture support
  install_modules_dependencies(s)
end
